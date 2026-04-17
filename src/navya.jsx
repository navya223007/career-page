import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "./career.css";

function CareerPage() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([]);

  const roles = ["React Dev", "Node Dev", "UI UX", "Java", "Python"];

  /* ================= SEND OTP ================= */

  const sendOtp = async () => {
    if (!email) return alert("Enter email first");

    try {
      const res = await axios.post("http://localhost:8082/api/send-otp", {
        email,
      });

      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "OTP failed");
    }
  };

  /* ================= VERIFY OTP ================= */

  const verifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:8082/api/verify-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        setVerified(true);

        alert("OTP Verified ✔");

        setStep(3); // move only after success
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  /* ================= UPLOAD EXCEL ================= */

  const uploadExcel = async () => {
    if (!file) return alert("Select Excel file");

    if (!verified) return alert("Verify OTP first");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    try {
      const res = await axios.post(
        "http://localhost:8082/api/upload-jobs",
        formData,
      );

      console.log("UPLOAD RESPONSE:", res.data);
      console.log("FULL RESPONSE:", res.data);
      console.log("JOBS FROM BACKEND:", res.data.jobs);

      // ✅ UPDATE STATE (THIS IS KEY)
      setJobs(res.data.jobs || []);

      alert(`Excel Uploaded ✔ Jobs: ${res.data.jobs.length}`);

      // ✅ move to success step
      setStep(4);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Upload failed");
    }
  };
  /* ================= FETCH JOBS ================= */

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:8082/api/jobs");

      setJobs(res.data.jobs);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      <h2 className="text-center mb-4 fw-bold">Career Portal</h2>

      {/* ================= ADMIN PANEL ================= */}

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Welcome to ABC Company</h2>

                <p className="text-muted">
                  Manage job postings with secure OTP verification
                </p>
              </div>

              <h5 className="text-center fw-semibold mb-4">
                1️⃣ Admin Setup (Excel Upload)
              </h5>

              {/* STEP 1 */}

              {step === 1 && (
                <div className="text-center py-4">
                  <button
                    className="btn btn-primary btn-lg px-5 rounded-pill shadow-sm"
                    onClick={() => setStep(2)}
                  >
                    📤 Start Upload Process
                  </button>
                </div>
              )}

              {/* STEP 2 OTP */}

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
                      onClick={verifyOtp}
                    >
                      ✔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 UPLOAD */}

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
                      onClick={uploadExcel}
                    >
                      🚀 Upload Excel File
                    </button>
                  </div>

                  <p className="text-muted small mt-2">
                    Supported format: .xlsx only
                  </p>
                </div>
              )}

              {/* STEP 4 DONE */}

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

      {/* ================= JOB CARDS ================= */}

      <div className="container my-5">
        <div className="text-center mb-4">
          <h3 className="fw-bold">🏢 Company Openings</h3>
          <p className="text-muted">Latest jobs from companies</p>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-track">
            {/* No Jobs */}
            {jobs.length === 0 && (
              <div className="w-100 text-center py-5">
                <h5 className="text-muted">
                  No jobs available. Please upload Excel.
                </h5>
              </div>
            )}

            {/* Jobs List */}
            {jobs.map((job, i) => (
              <div className="job-card" key={i}>
                {/* Job Role */}
                <h5 className="text-primary fw-bold mb-3">
                  💼 {job.role || "Not Available"}
                </h5>

                {/* Location */}
                <p className="mb-2">
                  📍 <strong>Location:</strong> {job.location || "Not Provided"}
                </p>

                {/* Job Type */}
                <p className="mb-2">
                  🧾 <strong>Job Type:</strong> {job.type || "Not Provided"}
                </p>

                {/* Description */}
                <p className="mb-0 text-muted">
                  📝 <strong>Description:</strong>{" "}
                  {job.desc || "No description"}
                </p>
              </div>
            ))}

            {/* Duplicate for Smooth Scroll */}
            {jobs.length > 0 &&
              jobs.map((job, i) => (
                <div className="job-card" key={`dup-${i}`}>
                  <h5 className="text-primary fw-bold mb-3">
                    💼 {job.role || "Not Available"}
                  </h5>

                  <p className="mb-2">
                    📍 <strong>Location:</strong>{" "}
                    {job.location || "Not Provided"}
                  </p>

                  <p className="mb-2">
                    🧾 <strong>Job Type:</strong> {job.type || "Not Provided"}
                  </p>

                  <p className="mb-0 text-muted">
                    📝 <strong>Description:</strong>{" "}
                    {job.desc || "No description"}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ================= APPLY FORM ================= */}

      <div className="card p-3 shadow">
        <h4>3️⃣ Applicant Form</h4>

        <div className="g-2">
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

        <div className="mt-3">
          <input className="form-control" placeholder="Search Role..." />
        </div>

        <div className="mt-3 d-flex flex-wrap gap-2">
          {roles.map((r, i) => (
            <span
              key={i}
              className="badge bg-secondary p-2"
              style={{
                cursor: "pointer",
              }}
            >
              {r} ✖
            </span>
          ))}
        </div>

        <div className="mt-3">
          <input type="file" className="form-control" />
        </div>

        <button className="btn btn-success w-100 mt-3">
          Submit Application
        </button>
      </div>
    </div>
  );
}

export default CareerPage;
