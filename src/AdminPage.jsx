import React, { useState } from "react";
import axios from "axios";

function AdminPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [file, setFile] = useState(null);

  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!email) return alert("Enter email");

    try {
      const res = await axios.post("http://localhost:8082/api/send-otp", {
        email,
      });

      alert(res.data.message || "OTP sent");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "OTP send failed");
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");

    try {
      const res = await axios.post("http://localhost:8082/api/verify-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        setVerified(true);
        setStep(3);
        alert("OTP verified ✔");
      } else {
        alert(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "OTP verification failed");
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

      console.log("UPLOAD RESPONSE:", res.data);

      if (res.data.success) {
        alert(`Uploaded ✔ Jobs: ${res.data.jobs.length}`);
        setStep(4);
      } else {
        alert(res.data.message || "Upload failed");
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Upload failed (server error)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Admin Page</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <button className="btn btn-primary" onClick={() => setStep(2)}>
          Start OTP Process
        </button>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="d-grid gap-2">
          <input
            className="form-control"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="btn btn-primary" onClick={sendOtp}>
            Send OTP
          </button>

          <input
            className="form-control"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button className="btn btn-success" onClick={verifyOtp}>
            Verify OTP
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="mt-3">
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            className="btn btn-dark mt-3 w-100"
            onClick={uploadExcel}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Excel"}
          </button>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="alert alert-success mt-4">Upload Successful 🚀</div>
      )}
    </div>
  );
}

export default AdminPage;
