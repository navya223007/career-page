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

/* ================= FILE STORAGE ================= */

const JOB_FILE = "./jobs.json";

/* ================= MEMORY ================= */

let hrEmail = "";
let jobs = [];

/* ================= LOAD OLD JOBS ================= */

if (fs.existsSync(JOB_FILE)) {
  jobs = JSON.parse(fs.readFileSync(JOB_FILE, "utf-8"));
  console.log("📂 Jobs loaded:", jobs.length);
}

/* ================= OTP STORAGE ================= */

const otpStore = new Map();

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ Email server ready");
  }
});

/* ================= OTP GENERATOR ================= */

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ================= SEND OTP ================= */

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email required",
    });
  }

  try {
    const otp = generateOTP();

    otpStore.set(email, {
      otp,
      verified: false,
      expiry: Date.now() + 5 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Career Portal OTP",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "OTP failed",
    });
  }
});

/* ================= VERIFY OTP ================= */

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const data = otpStore.get(email);

  if (!data) {
    return res.status(400).json({
      success: false,
      message: "OTP not found",
    });
  }

  if (Date.now() > data.expiry) {
    otpStore.delete(email);
    return res.status(400).json({
      success: false,
      message: "OTP expired",
    });
  }

  if (data.otp !== otp) {
    return res.status(401).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  data.verified = true;
  otpStore.set(email, data);

  res.json({
    success: true,
    message: "OTP verified",
  });
});

/* ================= MULTER ================= */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

/* ================= UPLOAD EXCEL ================= */

app.post("/api/upload-jobs", upload.single("file"), (req, res) => {
  console.log("\n=== EXCEL UPLOAD ===");

  const userEmail = req.body.email;
  const otpData = otpStore.get(userEmail);

  if (!otpData || !otpData.verified) {
    return res.status(403).json({
      success: false,
      message: "OTP not verified",
    });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    let headerRowIndex = -1;
    let detectedEmail = "";

    data.forEach((row) => {
      const rowText = row.join(" ").toLowerCase();

      if (rowText.includes("target email")) {
        detectedEmail = row[1];
      }

      if (
        row
          .map((cell) => cell.toString().trim().toLowerCase())
          .includes("job role")
      ) {
        headerRowIndex = data.indexOf(row);
      }
    });

    if (headerRowIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Header row not found",
      });
    }

    const headers = data[headerRowIndex];
    const jobsRows = data.slice(headerRowIndex + 1);

    const normalize = (str) =>
      str?.toString().trim().toLowerCase().replace(/\s+/g, " ");

    const findIndex = (name) =>
      headers.findIndex((h) => normalize(h) === normalize(name));

    const roleIndex = findIndex("Job Role");
    const locationIndex = findIndex("Location");
    const typeIndex = findIndex("Job Type");
    const descIndex = findIndex("Description");

    jobs = jobsRows
      .map((row) => ({
        role: row[roleIndex] || "",
        location: row[locationIndex] || "",
        type: row[typeIndex] || "",
        desc: row[descIndex] || "",
      }))
      .filter((job) => job.role);

    fs.writeFileSync(JOB_FILE, JSON.stringify(jobs, null, 2));

    hrEmail = detectedEmail;

    res.json({
      success: true,
      hrEmail,
      jobs,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
});

/* ================= RESET JOBS ================= */

app.get("/api/reset-jobs", (req, res) => {
  jobs = [];
  fs.writeFileSync(JOB_FILE, JSON.stringify([]));
  res.json({ message: "Jobs reset done" });
});

/* ================= GET JOBS ================= */

app.get("/api/jobs", (req, res) => {
  res.json({ jobs });
});

/* ================= APPLY JOB ================= */

const resumeUpload = multer({ dest: "uploads/" });

app.post("/api/apply", resumeUpload.single("resume"), async (req, res) => {
  const { name, email, phone, role } = req.body;

  if (!hrEmail) {
    return res.status(400).json({
      success: false,
      message: "Upload Excel first",
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: hrEmail,
      subject: `New Application - ${role}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Role: ${role}
      `,
      attachments: [{ path: req.file.path }],
    });

    res.json({
      success: true,
      message: "Application sent successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Application failed",
    });
  }
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
