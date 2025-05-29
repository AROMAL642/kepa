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

  // Count words in description (max 100 words)
  const wordCount = form.description.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent typing beyond 100 words in description
    if (name === "description" && value.trim().split(/\s+/).length > 100) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit repair request data (without PDF)
  const handleSubmit = async () => {
    try {
      const submitData = { ...form, date: new Date(form.date).toISOString() };
      await axios.post("http://localhost:5000/api/repair-request", submitData);
      alert("Repair request submitted");
    } catch (error) {
      alert("Error submitting request: " + error.message);
    }
  };

  // Generate and download PDF
  const generatePDF = async () => {
    try {
      const submitData = { ...form, date: new Date(form.date).toISOString() };
      const res = await axios.post(
        "http://localhost:5000/api/repair-request/pdf",
        submitData,
        {
          responseType: "blob", // important for binary response (PDF)
        }
      );

      if (res.status !== 200) {
        throw new Error("Failed to generate PDF");
      }

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `RepairRequest_${form.appNo || "unknown"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Error generating PDF. Check console and backend.");
    }
  };

  // Submit verification status
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
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="appNo"
          placeholder="Application No"
          value={form.appNo}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="vehicleNo"
          placeholder="Vehicle No"
          value={form.vehicleNo}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="input"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input"
          placeholder="Description (max 100 words)"
        />
        <p className="text-sm text-gray-500">{wordCount}/100 words</p>

        <div className="flex gap-4">
          <button onClick={handleSubmit} className="btn">
            Submit
          </button>
          <button onClick={generatePDF} className="btn-secondary">
            Generate PDF
          </button>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <label>Verify:</label>
        <div className="flex gap-4">
          <label>
            <input type="radio" name="verify" onChange={() => setVerify(true)} />{" "}
            Yes
          </label>
          <label>
            <input type="radio" name="verify" onChange={() => setVerify(false)} />{" "}
            No
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

        <button onClick={handleVerifySubmit} className="btn mt-2">
          Submit
        </button>
      </div>
    </div>
  );
}

export default RepairRequestForm;

