import React, { useState } from "react";

export default function CareerPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
    resume: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Application Submitted Successfully!");
  };

  const jobs = [
    {
      title: "React Developer",
      location: "Hyderabad",
      type: "Full Time",
    },
    {
      title: "Node.js Developer",
      location: "Bangalore",
      type: "Full Time",
    },
    {
      title: "UI/UX Designer",
      location: "Remote",
      type: "Contract",
    },
  ];

  return (
    <div style={{ fontFamily: "Arial", background: "#f4f6f8" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(to right, #2563eb, #4f46e5)",
          color: "white",
          padding: "60px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
          Join Our Team SES
        </h1>
        <p>
          We are looking for talented people to grow with us. Submit your resume
          and become part of our amazing team.
        </p>
      </section>

      {/* Job Openings */}
      <section style={{ padding: "40px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
          Current Openings
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {jobs.map((job, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "20px",
                width: "250px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3>{job.title}</h3>
              <p>Location: {job.location}</p>
              <p>Type: {job.type}</p>
              <button
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  width: "100%",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section style={{ padding: "40px", background: "white" }}>
        <div
          style={{
            maxWidth: "500px",
            margin: "auto",
            background: "#ffffff",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Submit Your Resume
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              required
              onChange={handleChange}
              style={inputStyle}
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="4"
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              required
              onChange={handleChange}
              style={inputStyle}
            />

            <button type="submit" style={buttonStyle}>
              Submit Application
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#111827",
          color: "white",
          textAlign: "center",
          padding: "15px",
          marginTop: "30px",
        }}
      >
        {/* <p> 2026 Your Company. All rights reserved.</p> */}
      </footer>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "16px",
  cursor: "pointer",
};
