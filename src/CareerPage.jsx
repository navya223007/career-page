import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import JobCarousel from "./JobCarousel";

function CareerPage() {
  const [jobs, setJobs] = useState([]);

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
      {/* ================= COMPANY SECTION ================= */}
      <div className="text-center mb-4">
        <h2>Welcome to ABC Company</h2>
        <p>We provide best job opportunities for developers</p>

        {/* ONLY ADMIN BUTTON */}
        <Link to="/admin" className="btn btn-dark">
          Admin Login
        </Link>
      </div>

      {/* ================= JOB CAROUSEL ================= */}
      {/* JOB CAROUSEL COMPONENT */}
      <JobCarousel jobs={jobs} />

      {/* ================= APPLY FORM ================= */}
      <div className="container">
        <h4>Apply Now</h4>

        <input className="form-control my-2" placeholder="Name" />
        <input className="form-control my-2" placeholder="Email" />
        <input className="form-control my-2" placeholder="Phone" />
        <input className="form-control my-2" placeholder="Role" />

        <button className="btn btn-success w-100">Submit Application</button>
      </div>
    </div>
  );
}

export default CareerPage;
