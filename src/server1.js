app.post("/apply", upload.single("resume"), async (req, res) => {
  const { name, email, jobRole, location } = req.body;

  const resumePath = req.file.path;

  // 👇 HR EMAIL FROM EXCEL (stored globally)
  const hrEmail = targetEmail;

  // ================= EMAIL TO HR =================
  const mailOptions = {
    from: process.env.EMAIL,
    to: hrEmail,
    subject: `New Job Application - ${jobRole}`,
    text: `
New Application Received

Name: ${name}
Email: ${email}
Job Role: ${jobRole}
Location: ${location}
    `,
    attachments: [
      {
        path: resumePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);

  // ================= SAVE TO DATABASE =================
  const sql = `
    INSERT INTO applications 
    (name, email, job_role, location, resume)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, email, jobRole, location, resumePath]);

  res.json({ message: "Application submitted successfully" });
});
