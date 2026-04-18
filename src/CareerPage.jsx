import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import JobCarousel from "./JobCarousel";
import ApplyForm from "./ApplyForm";
import Footer from "./Footer";

function CareerPage() {
  const [jobs, setJobs] = useState([]);
  const location = useLocation();

  const fetchJobs = () => {
    axios
      .get("http://localhost:8082/api/jobs")
      .then((res) => setJobs(res.data.jobs || []))
      .catch(console.log);
  };

  useEffect(() => {
    fetchJobs();

    // 🔥 IMPORTANT: refresh when coming from Admin upload
    if (location.state?.refresh) {
      fetchJobs();
    }
  }, [location]);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* HEADER */}
      <div className="text-center p-5 bg-white shadow-sm">
        <h2 className="fw-bold text-primary">Welcome to SES Company</h2>

        <p className="mt-2 text-muted">
          SES (Software & Electronics Solutions) is a technology-driven company
          focused on delivering innovative software development, web
          applications, and electronics-based smart solutions. We connect
          skilled developers with real-world industry opportunities.
        </p>

        <p className="text-muted">
          🚀 Build your career with modern technologies like React, Node.js,
          Java, UI/UX, and full-stack development at SES.
        </p>

        <Link to="/admin" className="btn btn-dark mt-3">
          Admin Login
        </Link>
      </div>

      {/* JOB CAROUSEL FULL WIDTH */}
      <div className="w-80 bg-light py-3">
        <JobCarousel jobs={jobs} />
      </div>

      {/* APPLY FORM CENTERED */}
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-0 p-4">
              <h4 className="text-center mb-3">Apply Now</h4>
              <ApplyForm />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default CareerPage;
