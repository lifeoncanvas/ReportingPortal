// ZonalReportingTabs.jsx – provides three tabs: Reporting Portal, Submit Report, Upload CSV/Excel
import React, { useState } from "react";
import ReportingPortal from "../../GlobalMgr/ReportingPortal/ReportingPortal"; // reuse global portal UI
import SubmitReport from "../../Report/SubmitReport";

// Simple upload component (download template & upload file)
function UploadTab() {
  const API = "http://localhost:8080/api/reports";
  const downloadTemplate = (type) => {
    // type: csv, xlsx, pdf
    window.open(`${API}/template/${type}`, "_blank");
  };
  const handleUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await fetch(`${API}/upload`, {
      method: "POST",
      body: formData,
    });
    alert("Upload completed");
  };
  return (
    <div style={styles.tabContent}>
      <h2>Download Empty Template</h2>
      <button onClick={() => downloadTemplate("csv")} style={styles.btn}>CSV</button>
      <button onClick={() => downloadTemplate("xlsx")} style={styles.btn}>XLSX</button>
      <button onClick={() => downloadTemplate("pdf")} style={styles.btn}>PDF</button>
      <button onClick={() => downloadTemplate("doc")} style={styles.btn}>DOC</button>
      <button onClick={() => downloadTemplate("docx")} style={styles.btn}>DOCX</button>
      <h3 style={{ marginTop: 20 }}>Upload Filled Template</h3>
      <input type="file" accept=".csv,.xlsx,.xls,.pdf,.doc,.docx" onChange={handleUpload} />
    </div>
  );
}

export default function ZonalReportingTabs() {
  const tabs = ["Reporting Portal", "Submit Report", "Upload CSV/Excel"];
  const [active, setActive] = useState(tabs[0]);

  const renderContent = () => {
    switch (active) {
      case "Reporting Portal":
        return <ReportingPortal />;
      case "Submit Report":
        return <SubmitReport />;
      case "Upload CSV/Excel":
        return <UploadTab />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.tabBar}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActive(t)}
            style={{
              ...styles.tabButton,
              ...(active === t ? styles.activeTab : {}),
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={styles.contentArea}>{renderContent()}</div>
    </div>
  );
}

const styles = {
  container: { margin: "20px auto", maxWidth: 960 },
  tabBar: { display: "flex", borderBottom: "2px solid #c8a951" },
  tabButton: {
    flex: 1,
    padding: "12px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#555",
  },
  activeTab: { borderBottom: "3px solid #c8a951", color: "#c8a951" },
  contentArea: { padding: "20px" },
  tabContent: { textAlign: "center" },
  btn: {
    margin: "4px",
    padding: "8px 16px",
    background: "#c8a951",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
};
