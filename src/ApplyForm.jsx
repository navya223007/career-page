import React, { useEffect, useState } from "react";
import axios from "axios";

function ApplyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [role, setRole] = useState([]);
  const [resume, setResume] = useState(null);

  const [errors, setErrors] = useState({});
  const [roleOptions, setRoleOptions] = useState([]);

  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= FETCH ROLES =================
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:8082/api/roles");
      setRoleOptions(res.data.roles || []);
    } catch (err) {
      console.log(err);
      setApiError("Failed to load roles");
    }
  };

  // ================= AUTO HIDE MESSAGES =================
  useEffect(() => {
    if (apiError || successMsg) {
      const timer = setTimeout(() => {
        setApiError("");
        setSuccessMsg("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [apiError, successMsg]);

  // ================= TOGGLE ROLE =================
  const toggleRole = (item) => {
    if (role.includes(item)) {
      setRole(role.filter((r) => r !== item));
    } else {
      setRole([...role, item]);
    }

    // clear role error
    setErrors((prev) => ({ ...prev, role: "" }));
    setApiError("");
  };

  // ================= VALIDATION =================
  const validate = () => {
    let temp = {};

    if (!name.trim()) temp.name = "Name is required";

    if (!email.trim()) {
      temp.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      temp.email = "Invalid email format";
    }

    if (!phone.trim()) {
      temp.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(phone)) {
      temp.phone = "Phone must be 10 digits";
    }

    if (role.length === 0) temp.role = "Select at least one role";

    if (!resume) {
      temp.resume = "Resume is required";
    } else if (resume.type !== "application/pdf") {
      temp.resume = "Only PDF file allowed";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // ================= SUBMIT =================
  const submitApplication = async () => {
    setApiError("");
    setSuccessMsg("");

    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("role", role.join(", "));
    formData.append("resume", resume);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8082/api/apply",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        setSuccessMsg("Application submitted ✔ Resume sent to HR email");

        setName("");
        setEmail("");
        setPhone("");
        setRole([]);
        setResume(null);
        setErrors({});
      } else {
        setApiError(res.data.message);
      }
    } catch (err) {
      console.log(err);
      setApiError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="text-center">SES APPLICATION FORM</h4>

      {/* ERROR / SUCCESS */}
      {apiError && <div className="alert alert-danger">{apiError}</div>}

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* NAME */}
      <input
        className="form-control my-2"
        placeholder="Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setErrors((prev) => ({
            ...prev,
            name: "",
          }));
          setApiError("");
        }}
      />

      {errors.name && <small className="text-danger">{errors.name}</small>}

      {/* EMAIL */}
      <input
        className="form-control my-2"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrors((prev) => ({
            ...prev,
            email: "",
          }));
          setApiError("");
        }}
      />

      {errors.email && <small className="text-danger">{errors.email}</small>}

      {/* PHONE */}
      <input
        className="form-control my-2"
        placeholder="Phone"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          setErrors((prev) => ({
            ...prev,
            phone: "",
          }));
          setApiError("");
        }}
      />

      {errors.phone && <small className="text-danger">{errors.phone}</small>}

      {/* ROLE SECTION */}
      <div className="mt-3">
        <label className="form-label fw-bold">Select Roles</label>

        <div className="d-flex flex-wrap gap-3">
          {roleOptions.map((item, index) => (
            <div key={index} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={role.includes(item)}
                onChange={() => toggleRole(item)}
                id={`role-${index}`}
              />

              <label className="form-check-label" htmlFor={`role-${index}`}>
                {item}
              </label>
            </div>
          ))}
        </div>

        {errors.role && <small className="text-danger">{errors.role}</small>}
      </div>

      {/* RESUME UPLOAD */}
      <div className="mt-3">
        <label className="form-label fw-bold">Upload Resume (PDF only)</label>

        <input
          type="file"
          className="form-control"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const file = e.target.files[0];

            if (!file) return;

            if (file.type !== "application/pdf") {
              alert("Only PDF files are allowed");
              e.target.value = "";
              setResume(null);
              return;
            }

            setResume(file);

            // clear resume error
            setErrors((prev) => ({
              ...prev,
              resume: "",
            }));

            setApiError("");
          }}
        />

        {errors.resume && (
          <small className="text-danger">{errors.resume}</small>
        )}
      </div>

      {/* SUBMIT */}
      <button
        className="btn btn-success w-100 mt-4"
        onClick={submitApplication}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </div>
  );
}

export default ApplyForm;
