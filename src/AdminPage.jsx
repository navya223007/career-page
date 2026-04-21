import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [file, setFile] = useState(null);

  const [step, setStep] = useState(1);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // ROLES STATE
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const navigate = useNavigate();

  const goHome = () => {
    navigate("/", { replace: true, state: { refresh: true } });
  };

  /* ================= FETCH ROLES FUNCTION ================= */

  const fetchRoles = () => {
    axios
      .get("http://localhost:8082/api/roles")
      .then((res) => {
        if (res.data.success) {
          setRoles(res.data.roles);
        }
      })
      .catch((err) => console.log(err));
  };

  /* ================= FETCH ROLES ON LOAD ================= */

  useEffect(() => {
    fetchRoles();
  }, []);

  /* ================= OTP ================= */

  const sendOtp = async () => {
    if (!email) {
      alert("Enter email");
      return;
    }

    try {
      await axios.post("http://localhost:8082/api/send-otp", {
        email,
      });

      setStep(2);
    } catch (err) {
      console.log(err);
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8082/api/verify-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        setVerified(true);
        setStep(3);
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      console.log(err);
      alert("OTP verification failed");
    }
  };

  /* ================= FILE SELECT ================= */

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only Excel files (.xlsx or .xls) allowed");
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  /* ================= FILE UPLOAD ================= */

  const uploadExcel = async () => {
    if (!file) {
      alert("Please select Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8082/api/upload-jobs",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setLoading(false);

      if (res.data.success) {
        setStep(4);

        // Refresh roles after upload
        fetchRoles();

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      alert("Upload failed");
    }
  };

  /* ================= ROLE SELECT TOGGLE ================= */

  const toggleRole = (id) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            {/* HEADER */}

            <div className="d-flex justify-content-between mb-3">
              <h4>Admin Panel</h4>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={goHome}
              >
                Home
              </button>
            </div>

            {/* STEP 1 */}

            {step === 1 && (
              <>
                <input
                  className="form-control mb-3"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button className="btn btn-primary w-100" onClick={sendOtp}>
                  Send OTP
                </button>
              </>
            )}

            {/* STEP 2 */}

            {step === 2 && (
              <>
                <input
                  className="form-control mb-3"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button className="btn btn-success w-100" onClick={verifyOtp}>
                  Verify OTP
                </button>
              </>
            )}

            {/* STEP 3 — FIXED HERE */}

            {step === 3 && (
              <>
                {/* Excel File Input */}

                <input
                  type="file"
                  className="form-control mb-3"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />

                <button
                  className="btn btn-dark w-100"
                  onClick={uploadExcel}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload Excel"}
                </button>
              </>
            )}

            {/* STEP 4 */}

            {step === 4 && (
              <div className="text-center">
                <div className="alert alert-success">Upload Completed 🚀</div>

                <button className="btn btn-primary" onClick={goHome}>
                  Go to Career Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
