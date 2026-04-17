import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Apply({ jobs }) {
  const { id } = useParams();
  const job = jobs[id]; // auto-selected job

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState(null);

  const handleApply = async () => {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("email", email);
    formData.append("jobRole", job.role);
    formData.append("location", job.location);
    formData.append("resume", resume);

    await axios.post("http://localhost:5000/apply", formData);

    alert("Application sent successfully!");
  };

  return (
    <div className="container mt-5">
      {/* JOB HEADER (NAUKRI STYLE) */}
      <div className="card p-3 mb-4 shadow-sm">
        <h4 className="text-primary">{job.role}</h4>
        <p>📍 {job.location}</p>
        <p>💼 {job.type}</p>
      </div>

      {/* FORM */}
      <div className="card p-4 shadow">
        <h5>Apply for this Job</h5>

        <input
          className="form-control mb-2"
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="file"
          className="form-control mb-3"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResume(e.target.files[0])}
        />

        <button className="btn btn-success w-100" onClick={handleApply}>
          Submit Application
        </button>
      </div>
    </div>
  );
}
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
export default Apply;
