require("dotenv").config();

/* ================= IMPORTS ================= */
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const nodemailer = require("nodemailer");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 8082;

/* ================= FILE ================= */
const DATA_FILE = "./data.json";

/* ================= MEMORY ================= */
let jobs = [];
let hrEmail = "";

/* ================= OTP STORAGE ================= */
const otpStore = new Map();

/* ================= LOAD DATA (IMPORTANT FIX) ================= */
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

    jobs = data.jobs || [];
    hrEmail = data.hrEmail || "";

    if (data.otpStore) {
      otpStore.clear();
      data.otpStore.forEach(([key, value]) => {
        otpStore.set(key, value);
      });
    }

    console.log("✅ Data Loaded");
    console.log("Jobs:", jobs.length);
    console.log("HR Email:", hrEmail);
  }
}

function saveData() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(
      {
        jobs,
        hrEmail,
        otpStore: Array.from(otpStore.entries()),
      },
      null,
      2,
    ),
  );
}

loadData();

/* ================= EMAIL ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= OTP ================= */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(email) {
  return email?.toString().trim().toLowerCase();
}

/* ================= SEND OTP ================= */
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  const otp = generateOTP();
  const key = normalizeEmail(email);

  otpStore.set(key, {
    otp,
    verified: false,
    expiry: Date.now() + 5 * 60 * 1000,
  });

  saveData();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}`,
  });

  res.json({ success: true, message: "OTP sent" });
});

/* ================= VERIFY OTP ================= */
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const key = normalizeEmail(email);
  const data = otpStore.get(key);

  if (!data)
    return res.status(400).json({ success: false, message: "OTP not found" });

  if (Date.now() > data.expiry)
    return res.status(400).json({ success: false, message: "OTP expired" });

  if (data.otp !== otp)
    return res.status(401).json({ success: false, message: "Invalid OTP" });

  data.verified = true;

  saveData();

  res.json({ success: true, message: "OTP verified" });
});

/* ================= MULTER ================= */
const upload = multer({ dest: "uploads/" });

/* ================= EXCEL UPLOAD ================= */
app.post("/api/upload-jobs", upload.single("file"), (req, res) => {
  const deleteFile = () => {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  };

  try {
    const email = normalizeEmail(req.body.email);
    const otpData = otpStore.get(email);

    if (!otpData || !otpData.verified) {
      return res.status(403).json({
        success: false,
        message: "OTP not verified",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel required",
      });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    if (!data?.length) {
      deleteFile();
      return res.status(400).json({
        success: false,
        message: "Excel is empty",
      });
    }

    /* ================= HELPERS ================= */
    const clean = (v) =>
      String(v || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/;

    /* ================= FIND HR EMAIL (FIXED) ================= */
    let hrEmail = "";

    for (const row of data) {
      const rowText = row.map(clean).join("");

      if (rowText.includes("targetemail")) {
        for (const cell of row) {
          const match = String(cell).match(emailRegex);

          if (match) {
            hrEmail = normalizeEmail(match[0]);
            break;
          }
        }
      }

      if (hrEmail) break;
    }

    if (!hrEmail) {
      deleteFile();
      return res.status(400).json({
        success: false,
        message: "Target Email not found",
      });
    }

    /* ================= FIND HEADER ROW ================= */
    let headerIndex = -1;

    for (let i = 0; i < data.length; i++) {
      const rowText = data[i].map(clean).join("");

      if (
        rowText.includes("jobrole") ||
        (rowText.includes("role") &&
          rowText.includes("location") &&
          rowText.includes("type") &&
          rowText.includes("desc"))
      ) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      deleteFile();
      return res.status(400).json({
        success: false,
        message: "Header row not found",
      });
    }

    const headers = data[headerIndex].map(clean);

    /* ================= COLUMN INDEX ================= */
    const findIndex = (keys) =>
      headers.findIndex((h) => keys.some((k) => h.includes(k)));

    const roleIndex = findIndex(["role", "jobrole"]);
    const locationIndex = findIndex(["location"]);
    const typeIndex = findIndex(["type", "jobtype"]);
    const descIndex = findIndex(["desc", "description"]);

    if (
      roleIndex === -1 ||
      locationIndex === -1 ||
      typeIndex === -1 ||
      descIndex === -1
    ) {
      deleteFile();
      return res.status(400).json({
        success: false,
        message: "Invalid columns in Excel",
      });
    }

    /* ================= BUILD JOBS ================= */
    const jobsData = [];
    const errors = [];

    for (let i = headerIndex + 1; i < data.length; i++) {
      const row = data[i];

      const job = {
        role: row[roleIndex],
        location: row[locationIndex],
        type: row[typeIndex],
        desc: row[descIndex],
      };

      // skip empty rows
      if (!job.role && !job.location && !job.type && !job.desc) continue;

      // collect validation errors
      if (!job.role || !job.location || !job.type || !job.desc) {
        errors.push({
          row: i + 1,
          issue: "Missing required field",
        });
        continue;
      }

      jobsData.push(job);
    }

    if (jobsData.length === 0) {
      deleteFile();
      return res.status(400).json({
        success: false,
        message: "No valid job rows found",
      });
    }

    /* ================= SAVE ================= */
    jobs = jobsData;
    global.hrEmail = hrEmail;

    fs.writeFileSync(DATA_FILE, JSON.stringify({ jobs, hrEmail }, null, 2));

    deleteFile();

    return res.json({
      success: true,
      message: "Jobs uploaded successfully",
      hrEmail,
      jobs,
      errors,
    });
  } catch (err) {
    console.log("UPLOAD ERROR:", err);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      deleteFile();
    }

    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
});
/* ================= APPLY JOB ================= */
app.post("/api/apply", upload.single("resume"), async (req, res) => {
  const { name, email, phone, role } = req.body;

  if (!name || !email || !phone || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields required",
    });
  }

  if (!hrEmail) {
    return res.status(400).json({
      success: false,
      message: "Upload Excel first",
    });
  }

  const filePath = req.file?.path;

  // ✅ Respond immediately (FAST UI response)
  res.json({
    success: true,
    message: "Application received (sending email...)",
  });

  // 🔥 Send email in background (NON-BLOCKING)
  transporter.sendMail(
    {
      from: process.env.EMAIL_USER,
      to: hrEmail,
      subject: `New Application - ${role}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nRole: ${role}`,
      attachments: [
        {
          filename: req.file.originalname,
          path: filePath,
        },
      ],
    },
    (err, info) => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (err) {
        console.log("Email error:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    },
  );
});
/* ================= GET JOBS ================= */
app.get("/api/jobs", (req, res) => {
  res.json({ jobs });
});

/* ================= ROLES ================= */
app.get("/api/roles", (req, res) => {
  try {
    if (!Array.isArray(jobs)) {
      return res.status(200).json({
        success: true,
        roles: [],
        message: "No jobs found",
      });
    }

    const roles = [
      ...new Set(
        jobs
          .filter((j) => j && j.role) // safety check
          .map((j) => j.role.trim()),
      ),
    ];

    return res.status(200).json({
      success: true,
      roles,
    });
  } catch (err) {
    console.log("Roles API error:", err);

    return res.status(500).json({
      success: false,
      roles: [],
      message: "Failed to fetch roles",
    });
  }
});
/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
