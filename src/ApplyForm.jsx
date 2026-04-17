import React, { useState } from "react";

function ApplyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const submit = () => {
    alert("Application submitted (connect backend later)");
  };

  return (
    <div className="container py-4">
      <h2>Apply Job</h2>

      <input
        className="form-control my-2"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="form-control my-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="form-control my-2"
        placeholder="Phone"
        onChange={(e) => setPhone(e.target.value)}
      />

      <button className="btn btn-success w-100" onClick={submit}>
        Submit
      </button>
    </div>
  );
}

export default ApplyForm;
