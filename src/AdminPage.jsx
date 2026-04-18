import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [file, setFile] = useState(null);

  const [step, setStep] = useState(1);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const goHome = () => {
    navigate("/", { replace: true, state: { refresh: true } });
  };

  const sendOtp = async () => {
    await axios.post("http://localhost:8082/api/send-otp", { email });
    setStep(2);
  };

  const verifyOtp = async () => {
    const res = await axios.post("http://localhost:8082/api/verify-otp", {
      email,
      otp,
    });

    if (res.data.success) {
      setVerified(true);
      setStep(3);
    }
  };

  const uploadExcel = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    setLoading(true);

    const res = await axios.post(
      "http://localhost:8082/api/upload-jobs",
      formData,
    );

    setLoading(false);

    if (res.data.success) {
      setStep(4);

      setTimeout(() => {
        navigate("/", { replace: true, state: { refresh: true } });
      }, 1000);
    }
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

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <input
                  type="file"
                  className="form-control mb-3"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files[0])}
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
