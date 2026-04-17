import React, { useState } from "react";
import axios from "axios";

function AdminUploadPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [file, setFile] = useState(null);

  const sendOtp = async () => {
    await axios.post("http://localhost:8082/api/send-otp", { email });
    alert("OTP sent");
  };

  const verifyOtp = async () => {
    await axios.post("http://localhost:8082/api/verify-otp", { email, otp });
    setStep(3);
  };

  const uploadExcel = async () => {
    const formData = new FormData();
    formData.append("file", file);

    await axios.post("http://localhost:8082/api/upload-excel", formData);

    alert("Upload Success ✔");

    // RESET AFTER UPLOAD
    setStep(1);
    setEmail("");
    setOtp("");
    setFile(null);
  };

  return (
    <div className="container mt-4">
      <h3>Admin Excel Upload</h3>

      {step === 1 && (
        <button className="btn btn-primary" onClick={() => setStep(2)}>
          Start Upload
        </button>
      )}

      {step === 2 && (
        <div>
          <input
            className="form-control mb-2"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="btn btn-primary" onClick={sendOtp}>
            Send OTP
          </button>

          <input
            className="form-control mt-2"
            placeholder="OTP"
            onChange={(e) => setOtp(e.target.value)}
          />

          <button className="btn btn-success mt-2" onClick={verifyOtp}>
            Verify OTP
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button className="btn btn-dark mt-2" onClick={uploadExcel}>
            Upload Excel
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminUploadPage;
