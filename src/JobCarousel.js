import React from "react";
import JobCard from "./JobCard";

function JobCarousel({ jobs }) {
  return (
    <div className="carousel-wrapper">
      <div className="carousel-track">
        {jobs.length === 0 && <p className="text-center">No jobs available</p>}

        {jobs.map((job, i) => (
          <JobCard key={i} job={job} />
        ))}
      </div>
    </div>
  );
}

export default JobCarousel;
