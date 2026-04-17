import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "./career.css";

function CareerPage() {
  const [step, setStep] = useState(1);
  localStorage.setItem("uploadDone", "true");
  // 1 = upload button
  // 2 = email + otp
  // 3 = file upload
  // 4 = completed
  // UI states only (backend later)
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [file, setFile] = useState(null);
  const jobs = [
    {
      role: "React Dev",
      location: "Hyderabad",
      type: "Full Time",
      desc: "UI Dev",
    },
    {
      role: "Node Dev",
      location: "Hyderabad",
      type: "Full Time",
      desc: "API Dev",
    },
    {
      role: "UI UX",
      location: "Bangalore",
      type: "Internship",
      desc: "Design",
    },
  ];

  const roles = ["React Dev", "Node Dev", "UI UX", "Java", "Python"];

  const sendOtp = async () => {
    try {
      const res = await axios.post("http://localhost:8082/api/send-otp", {
        email,
      });

      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "OTP failed");
    }
  };
  const verifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:8082/api/verify-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        setVerified(true);
        alert("OTP Verified ✔ Excel Upload Enabled");
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };
  const uploadExcel = async () => {
    if (!file) return alert("Select Excel file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8082/api/upload-excel",
        formData,
      );

      alert(`Excel Uploaded ✔ Jobs: ${res.data.jobs.length}`);
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      <h2 className="text-center mb-4 fw-bold">Career Portal</h2>

      {/* =========================
          SECTION 1 - ADMIN PANEL
      ========================== */}
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* MAIN CARD */}
            <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white">
              {/* HEADER */}
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Welcome to ABC Company</h2>
                <p className="text-muted mb-0">
                  Manage job postings with secure OTP verification
                </p>
              </div>

              {/* TITLE */}
              <h5 className="text-center fw-semibold mb-4">
                1️⃣ Admin Setup (Excel Upload)
              </h5>

              {/* ================= STEP 1 ================= */}
              {step === 1 && (
                <div className="text-center py-4">
                  <button
                    className="btn btn-primary btn-lg px-5 rounded-pill shadow-sm"
                    onClick={() => setStep(2)}
                  >
                    📤 Start Upload Process
                  </button>
                  <p className="text-muted mt-3 small">
                    Click to begin OTP verification
                  </p>
                </div>
              )}

              {/* ================= STEP 2 OTP ================= */}
              {step === 2 && (
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-md-5">
                    <input
                      className="form-control form-control-lg"
                      placeholder="Enter Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <button
                      className="btn btn-primary w-100 btn-lg"
                      onClick={sendOtp}
                    >
                      Send OTP
                    </button>
                  </div>

                  <div className="col-12 col-md-3">
                    <input
                      className="form-control form-control-lg"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-1 d-grid">
                    <button
                      className="btn btn-success btn-lg"
                      onClick={() => {
                        verifyOtp();
                        setStep(3);
                      }}
                    >
                      ✔
                    </button>
                  </div>
                </div>
              )}

              {/* ================= STEP 3 UPLOAD ================= */}
              {step === 3 && (
                <div className="mt-4 text-center">
                  <div className="border border-dashed p-4 rounded-4 bg-light">
                    <input
                      type="file"
                      className="form-control form-control-lg"
                      onChange={(e) => setFile(e.target.files[0])}
                    />

                    <button
                      className="btn btn-dark btn-lg w-100 mt-3 rounded-pill"
                      onClick={() => {
                        uploadExcel();
                        setStep(4);
                      }}
                    >
                      🚀 Upload Excel File
                    </button>
                  </div>

                  <p className="text-muted small mt-2">
                    Supported format: .xlsx only
                  </p>
                </div>
              )}

              {/* ================= STEP 4 DONE ================= */}
              {step === 4 && (
                <div className="text-center mt-4">
                  <div className="alert alert-success rounded-4 shadow-sm py-4">
                    <h5 className="mb-2">✔ Upload Successful</h5>
                    <p className="mb-0">Career Portal is now active 🚀</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* =========================
          SECTION 2 - OPENINGS
      ========================== */}
      {/* <div className="card p-3 mb-4 shadow">
        <h4>2️⃣ Company Openings</h4>

        <div className="d-flex overflow-auto gap-3 p-2">
          {jobs.map((job, i) => (
            <div
              key={i}
              className="card p-3 shadow-sm"
              style={{ minWidth: "250px" }}
            >
              <h5 className="text-primary">{job.role}</h5>
              <p className="mb-1">📍 {job.location}</p>
              <p className="mb-1">💼 {job.type}</p>
              <small className="text-muted">{job.desc}</small>
            </div>
          ))}
        </div>
      </div> */}

      <div className="container my-5">
        <div className="text-center mb-4">
          <h3 className="fw-bold">🏢 Company Openings</h3>
          <p className="text-muted">Latest jobs from companies</p>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-track">
            {/* FIRST SET */}
            {jobs.map((job, i) => (
              <div className="job-card" key={`a-${i}`}>
                <h5 className="text-primary">{job.role}</h5>
                <p className="mb-1">📍 {job.location}</p>
                <p className="mb-1">💼 {job.type}</p>
                <small className="text-muted">{job.desc}</small>
              </div>
            ))}

            {/* DUPLICATE SET (IMPORTANT FOR SMOOTH LOOP) */}
            {jobs.map((job, i) => (
              <div className="job-card" key={`b-${i}`}>
                <h5 className="text-primary">{job.role}</h5>
                <p className="mb-1">📍 {job.location}</p>
                <p className="mb-1">💼 {job.type}</p>
                <small className="text-muted">{job.desc}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* =========================
          SECTION 3 - APPLY FORM
      ========================== */}
      <div className="card p-3 shadow">
        <h4>3️⃣ Applicant Form</h4>

        <div className="g-2 ">
          <div className="col-md-4 mt-3">
            <input className="form-control" placeholder="Full Name" />
          </div>

          <div className="col-md-4 mt-3">
            <input className="form-control" placeholder="Email" />
          </div>

          <div className="col-md-4 mt-3">
            <input className="form-control" placeholder="Phone Number" />
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-3">
          <input className="form-control" placeholder="Search Role..." />
        </div>

        {/* ROLE TAGS */}
        <div className="mt-3 d-flex flex-wrap gap-2">
          {roles.map((r, i) => (
            <span
              key={i}
              className="badge bg-secondary p-2"
              style={{ cursor: "pointer" }}
            >
              {r} ✖
            </span>
          ))}
        </div>

        {/* RESUME */}
        <div className="mt-3">
          <input type="file" className="form-control" />
        </div>

        {/* SUBMIT */}
        <button className="btn btn-success w-100 mt-3">
          Submit Application
        </button>
      </div>
    </div>
  );
}

export default CareerPage;
