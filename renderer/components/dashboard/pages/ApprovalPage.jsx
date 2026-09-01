import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Clock, X, AlertCircle } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import { 
  fetchInspectorDashboard,
  acceptReport, 
  rejectReport 
} from "../../../services/api";
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";
const ApprovalPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState(null);

const [tooltipVisible, setTooltipVisible] = useState({});
  useEffect(() => {
    loadReports();
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) { 
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setRecords(MOCK_DATA);
      } else {
        try {
          // ✅ USE fetchDashboardData (same as Dashboard page - IT WORKS!)
          const data = await fetchInspectorDashboard();

          if (!data || data.length === 0) {
            setRecords([]);
          } else {
            setRecords(data);
          }
        } catch (apiErr) {
          setUseMockData(true);
          setRecords(MOCK_DATA);
        }
      }
    } catch (err) {
      setError(err.message);
      setRecords(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, workName) => {
    if (submitting) return;
    setSubmitting(true);

    try {
await acceptReport(id);
await loadReports();

      setSuccessMessage({
        type: "success",
        title: "Report Approved! ✅",
        message: `${workName} has been approved successfully`,
      });

    } catch (err) {
      setSuccessMessage({
        type: "error",
        title: "Approval Failed ❌",
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (rejectReason.trim().length === 0) {
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
     await rejectReport(rejectModal.id, rejectReason);
     await loadReports();


      setSuccessMessage({
        type: "warning",
        title: "Report Rejected ❌",
        message: `${rejectModal.workName} has been rejected`,
      });

      setRejectModal(null);
      setRejectReason("");

    } catch (err) {
      setSuccessMessage({
        type: "error",
        title: "Rejection Failed ❌",
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats
  const totalPending = records.filter(
    r =>
      r.status === "Done" &&
      r.insepectorStatus === "In-Progress"
  ).length;

  const approvedToday = records.filter(
    r =>
      r.insepectorStatus === "Done" &&
      r.status !== "reject"
  ).length;

  const rejectedToday = records.filter(
    r =>
      r.status === "reject"
  ).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: "#ffffff",
        padding: "20px",
        borderRadius: "16px",
        minHeight: "100vh"
      }}
    >

      {/* SUCCESS/ERROR MESSAGE POPUP */}
      {successMessage && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          padding: "16px 24px",
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          background: successMessage.type === "success" ? "#f0fdf4" : successMessage.type === "warning" ? "#fef2f2" : "#fef2f2",
          border: `2px solid ${successMessage.type === "success" ? "#22c55e" : "#dc2626"}`,
          zIndex: 2000,
          maxWidth: 400,
        }}>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(400px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ fontSize: 24, marginTop: 2 }}>
              {successMessage.type === "success" ? "✅" : "❌"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: successMessage.type === "success" ? "#166534" : "#991b1b", margin: "0 0 4px" }}>
                {successMessage.title}
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                {successMessage.message}
              </p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9ca3af", padding: 0 }}
            >
              ×
            </button>
          </div>
        </div>
      )}


      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Pending Review", value: totalPending, bg: "#fffbeb", color: "#b45309", border: "#fde68a", icon: Clock },
          { label: "Approved Today", value: approvedToday, bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", icon: CheckCircle },
          { label: "Rejected Today", value: rejectedToday, bg: "#fef2f2", color: "#991b1b", border: "#fecaca", icon: XCircle },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ borderRadius: 16, padding: "14px 18px", background: s.bg, border: `1.5px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".16em", color: s.color, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#111", fontFamily: "'Georgia',serif", lineHeight: 1 }}>{s.value}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={s.color} strokeWidth={2.2} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ borderRadius: 16, padding: "56px", textAlign: "center", background: "#fff", border: "1px solid #f0ede6" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "4px solid #fde68a", borderTopColor: "#f5c100", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#9ca3af", fontSize: 13, fontWeight: 600, margin: 0 }}>Loading reports...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{ borderRadius: 16, padding: 24, background: "#fef2f2", border: "1.5px solid #fecaca" }}>
          <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 12 }}>⚠️ Error: {error}</p>
          <button
            onClick={loadReports}
            style={{ padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Pending table */}
      {!loading && !error && (
        <div style={{ 
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #f0ede6",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  overflow: "visible"
}}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0ede6", background: "linear-gradient(90deg,#fffdf5,#fff)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 900, color: "#111", margin: 0 }}>Pending Approvals</h2>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontWeight: 500 }}>Reports waiting for your review</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "5px 12px", borderRadius: 8, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>
              {totalPending} Pending
            </span>
          </div>

          {records.length === 0 ? (
            <div style={{ padding: "56px", textAlign: "center" }}>
              <CheckCircle size={40} color="#22c55e" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: "#166534", margin: "0 0 4px" }}>All caught up!</p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>No pending approvals at this time.</p>
            </div>
          ) : (
           <div style={{ overflowX: "auto", overflowY: "visible" }}>
              <table style={{ 
                width: "100%",
                borderCollapse: "collapse",
                position: "relative",
                zIndex: 1
              }}>
                <thead>
                  <tr style={{ background: "#fafaf8", borderBottom: "2px solid #f0ede6" }}>
                    {["Work Name", "Contractor Name", "Amount", "Submitted", "View Report", "Actions", "Status"].map((h) => (
                      <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".15em", color: "#9ca3af", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => {
                    const isPending = r.status === "Done" && r.insepectorStatus === "In-Progress";
                    const isApproved = r.insepectorStatus === "Done" && r.status !== "reject";
                    const isRejected = r.status === "reject";

                    return (
                      <tr 
                        key={r.id} 
                        style={{ 
                          borderBottom: "1px solid #f5f4f0", 
                     background: "#fff"
                        }}
                      >
                        <td style={{ padding: "16px 28px", fontSize: 13, fontWeight: 800, color: "#111" }}>{r.workName}</td>
                        <td style={{ padding: "16px 28px", fontSize: 13, color: "#6b7280" }}>{r.userName}</td>
                 
                        <td style={{ padding: "16px 28px", fontSize: 13, fontWeight: 900, color: "#111" }}>₹{r.totalAmount?.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "16px 28px", fontSize: 11, color: "#9ca3af" }}>{fmt(r.createdDate)}</td>
                        
                        {/* VIEW REPORT COLUMN */}
                       <td style={{ padding: "16px 28px" }}>
<button
  onClick={() =>
    setViewModal({
      ...r,
      pdfUrl: r.editUrl || null  // ✅ directly use editUrl
    })
  }
  style={{
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer"
  }}
>
  📄 View Report
</button>
</td>

                        {/* ACTIONS COLUMN */}
                        <td style={{ padding: "13px 20px" }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(r.id, r.workName)}
                                  style={{
                                    padding: "7px 16px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: "none",
                                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                                    color: "#fff",
                                    cursor: "pointer"
                                  }}
                                >
                                  ✓ Approve
                                </button>

                                <button
                                  onClick={() => {
                                    setViewModal(null);
                                    setRejectModal({ id: r.id, workName: r.workName });
                                  }}
                                  style={{
                                    padding: "7px 16px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: "1px solid #fecaca",
                                    background: "#fff",
                                    color: "#dc2626",
                                    cursor: "pointer"
                                  }}
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 14px",
                                borderRadius: 8,
                                background: "#dcfce7",
                                border: "1.5px solid #86efac"
                              }}>
                                <CheckCircle size={14} color="#16a34a" />
                                <span style={{ fontSize: 11, fontWeight: 800, color: "#16a34a" }}>
                                  APPROVED
                                </span>
                              </div>
                            )}

  {isRejected && (
  <div
    onMouseEnter={() => setTooltipVisible(prev => ({ ...prev, [r.id]: true }))}
    onMouseLeave={() => setTooltipVisible(prev => ({ ...prev, [r.id]: false }))}
    style={{ position: "relative", display: "inline-block" }}
  >
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 14px",
      borderRadius: 8,
      background: "#fee2e2",
      border: "1.5px solid #fca5a5",
      cursor: "pointer"
    }}>
      <XCircle size={14} color="#dc2626" />
      <span style={{ fontSize: 11, fontWeight: 800, color: "#dc2626" }}>
        REJECTED
      </span>
    </div>

    {tooltipVisible[r.id] && r.reason && (
      <div style={{
        position: "absolute",
        top: "120%",   // 👈 खाली येईल
        left: "50%",
        transform: "translateX(-50%)",
        background: "#dc2626",   // 👈 red background
        color: "#fff",
        padding: "12px 16px",
        borderRadius: 8,
        fontSize: 12,
        width: 340,
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        zIndex: 9999
      }}>
        {r.reason}
      </div>
    )}
  </div>
)}

                          </div>
                        </td>
<td style={{ padding: "13px 20px" }}>

  {isPending && (
    <StatusBadge status="Pending" />
  )}

  {isApproved && (
    <span
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#166534"
      }}
    >
      Report Accepted
    </span>
  )}

  {isRejected && (
    <span
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#dc2626"
      }}
    >
      Report Rejected
    </span>
  )}

</td>
                           
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============= VIEW REPORT MODAL ============= */}
{viewModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3000
    }}
  >
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6)"
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          background: "linear-gradient(135deg,#facc15,#eab308)",
          color: "#1f2937",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          📄 {viewModal.workName}
        </div>

        <button
          onClick={() => setViewModal(null)}
          style={{
            background: "rgba(0,0,0,0.1)",
            color: "#1f2937",
            border: "none",
            fontSize: 18,
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            fontWeight: 700
          }}
        >
          ✕
        </button>
      </div>

      {/* PDF Area */}
      <div style={{ flex: 1, background: "#f3f4f6" }}>

        {viewModal.pdfUrl ? (
          <iframe
            src={`${viewModal.pdfUrl}#toolbar=0`}
            title="PDF Viewer"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: 12,
            color: "#6b7280"
          }}>
            <span style={{ fontSize: 48 }}>📄</span>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
              No document available
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
              This report has no attached PDF.
            </p>
          </div>
        )}

      </div>
    </div>
  </div>
)}

      {/* ============= REJECT REASON MODAL ============= */}
      {rejectModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 450, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#991b1b", margin: 0 }}>❌ Reject Report</h3>
              <button 
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 16px" }}>
              Work: <strong>{rejectModal.workName}</strong>
            </p>

            <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>Why are you rejecting this report?</p>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter the reason for rejection (e.g., Missing documents, Incorrect data, etc.)"
              style={{ 
                width: "100%", 
                minHeight: 100, 
                padding: 10, 
                borderRadius: 8, 
                border: "1.5px solid #e5e7eb", 
                fontSize: 12, 
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box"
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button 
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                style={{ flex: 1, padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 800, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={submitting || rejectReason.trim().length === 0}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  background: rejectReason.trim()
                    ? "#fef2f2"
                    : "#f3f4f6",
                  color: rejectReason.trim()
                    ? "#991b1b"
                    : "#9ca3af",
                  border: "1.5px solid #fecaca",
                  cursor:
                    submitting || rejectReason.trim().length === 0
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    submitting || rejectReason.trim().length === 0
                      ? 0.6
                      : 1
                }}
              >
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalPage;
