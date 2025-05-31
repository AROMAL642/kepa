import { useState } from "react";
import axios from "axios";
import './App.css';

function RepairRequestForm() {
  const [form, setForm] = useState({
    date: "",
    appNo: "",
    vehicleNo: "",
    subject: "",
    description: "",
  });
  const [verify, setVerify] = useState(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [file, setFile] = useState(null);

  const wordCount = form.description.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "description" && value.trim().split(/\s+/).length > 100) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && (uploadedFile.type.includes("pdf") || uploadedFile.type.includes("image"))) {
      setFile(uploadedFile);
    } else {
      alert("Please upload a valid PDF or image file.");
      e.target.value = null;
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, key === "date" ? new Date(value).toISOString() : value);
      });
      if (file) {
        formData.append("file", file);
      }

      await axios.post("http://localhost:5000/api/repair-request", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Repair request submitted");
    } catch (error) {
      alert("Error submitting request: " + error.message);
    }
  };

  const handleVerifySubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/repair-request/verify", {
        appNo: form.appNo,
        verified: verify,
        issue: verify === false ? issueDescription : null,
      });
      alert("Verification submitted");
    } catch (error) {
      alert("Error submitting verification: " + error.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Request for Repair</h2>

      <div className="grid gap-4">
        <input type="date" name="date" value={form.date} onChange={handleChange} className="input" />
        <input type="text" name="appNo" placeholder="Application No" value={form.appNo} onChange={handleChange} className="input" />
        <input type="text" name="vehicleNo" placeholder="Vehicle No" value={form.vehicleNo} onChange={handleChange} className="input" />
        <input type="text" name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} className="input" />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input"
          placeholder="Description (max 100 words)"
        />
        <p className="text-sm text-gray-500">{wordCount}/100 words</p>

        <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} className="input" />
        {file && <p className="text-sm text-green-600">File selected: {file.name}</p>}

        <button onClick={handleSubmit} className="btn">
          Submit
        </button>
      </div>

      <div className="mt-6 border-t pt-4">
        <label>Verify:</label>
        <div className="flex gap-4">
          <label>
            <input type="radio" name="verify" onChange={() => setVerify(true)} /> Yes
          </label>
          <label>
            <input type="radio" name="verify" onChange={() => setVerify(false)} /> No
          </label>
        </div>

        {verify === false && (
          <textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="input mt-2"
            placeholder="What is still not fixed?"
          />
        )}
        


        {file && (
  <div className="mt-4">
    <p className="text-sm text-green-600">File selected: {file.name}</p>
    <p className="text-sm text-blue-600 underline">
      Preview:
    </p>
    {file.type.includes("pdf") ? (
      <iframe
        src={URL.createObjectURL(file)}
        width="100%"
        height="400px"
        title="PDF Preview"
      />
    ) : (
      <img
        src={URL.createObjectURL(file)}
        alt="Preview"
        className="max-w-full max-h-96 rounded border"
      />
    )}
  </div>
)}

        <button onClick={handleVerifySubmit} className="btn mt-2">
          Submit
        </button>
      </div>
    </div>
  );
}

export default RepairRequestForm;


