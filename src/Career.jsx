import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./career.css";

function CareerPage() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  const roles = ["React Dev", "Node Dev", "UI UX", "Java", "Python"];

  /* ================= FETCH JOBS ================= */

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:8082/api/jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      {/* ================= HEADER ================= */}
      <h2 className="text-center mb-4 fw-bold">Career Portal</h2>

      {/* ================= ADMIN BUTTON ================= */}
      <div className="text-end mb-3">
        <button className="btn btn-dark" onClick={() => navigate("/admin")}>
          🔐 Admin Login
        </button>
      </div>

      {/* ================= JOBS SECTION ================= */}
      <div className="container my-5">
        <div className="text-center mb-4">
          <h3 className="fw-bold">🏢 Company Openings</h3>
          <p className="text-muted">Latest jobs from companies</p>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-track">
            {/* NO JOBS */}
            {jobs.length === 0 && (
              <div className="w-100 text-center py-5">
                <h5 className="text-muted">
                  No jobs available. Please contact admin.
                </h5>
              </div>
            )}

            {/* JOB LIST */}
            {jobs.map((job, i) => (
              <div className="job-card" key={i}>
                <h5 className="text-primary fw-bold mb-3">
                  💼 {job.role || "Not Available"}
                </h5>

                <p className="mb-2">
                  📍 <strong>Location:</strong> {job.location || "Not Provided"}
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

            {/* DUPLICATE FOR SCROLL EFFECT */}
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

        <div className="row g-3 mt-2">
          <div className="col-md-4">
            <input className="form-control" placeholder="Full Name" />
          </div>

          <div className="col-md-4">
            <input className="form-control" placeholder="Email" />
          </div>

          <div className="col-md-4">
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
              {r}
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
