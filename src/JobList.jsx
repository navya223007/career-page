import React, { useEffect, useState } from "react";
import axios from "axios";

function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await axios.get("http://localhost:8082/api/jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.log(err);
      alert("Failed to load jobs");
    }
  };

  return (
    <div className="container py-4">
      <h2>Job Openings</h2>

      {jobs.length === 0 ? (
        <p>No jobs available</p>
      ) : (
        jobs.map((job, i) => (
          <div key={i} className="card p-3 my-2">
            <h5>{job.role}</h5>
            <p>{job.location}</p>
            <p>{job.type}</p>
            <p>{job.desc}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default JobList;
