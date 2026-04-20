import { useState } from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import TestDetailModal from "./TestDetailModal";

const TestTable = ({ tests = [] }) => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const recordsPerPage = 10;
  const totalPages     = Math.max(1, Math.ceil(tests.length / recordsPerPage));
  const currentRecords = tests.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <>
      <div style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid #f0ede6", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        {/* Header */}
        <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0ede6", background: "linear-gradient(90deg,#fffdf5,#fff)" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 900, color: "#111", margin: 0 }}>Laboratory Reports</h2>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontWeight: 500 }}>Material testing reports and approval status</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, padding: "5px 12px", borderRadius: 8, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>
            {tests.length} Records
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#fafaf8", borderBottom: "2px solid #f0ede6" }}>
              {["Work Name", "Material Name", "Price","Status", "Action"].map((h) => (
  <th
    key={h}
    style={{
      padding: "11px 20px",
      textAlign: "left",
      fontSize: 10,
      fontWeight: 1000,
      textTransform: "uppercase",
      letterSpacing: ".15em",
      color: "#000",
      width: "20%"   // ⭐ ADD THIS
    }}
  >
    {h}
  </th>
))}
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No records found.</td></tr>
              ) : currentRecords.map((test, i) => (
                <tr
                  key={test.id}
                  style={{ borderBottom: "1px solid #f5f4f0", background: i % 2 === 1 ? "#fdfdf9" : "#fff", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,193,0,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 1 ? "#fdfdf9" : "#fff")}
                >
               <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 800 }}>
  {test.workName}
</td>

<td style={{ padding: "13px 20px", fontSize: 13 }}>
  {Array.isArray(test.materialName)
    ? test.materialName.map(m => m.category).join(", ")
    : "N/A"
  }
</td>

<td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 900 }}>
  ₹{Number(test.price).toLocaleString("en-IN")}
</td>

<td style={{ padding: "13px 20px" }}>
  <StatusBadge status={test.status} rejectionReason={test.rejectionReason} />
</td>
                  <td style={{ padding: "13px 20px" }}>
                    <button
onClick={() => {
  console.log("Clicked", test);
  setSelectedTest(test);
}}                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 10, fontSize: 11, fontWeight: 800, background: "linear-gradient(135deg,#f5c100,#e6a800)", color: "#1a0f00", border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(245,193,0,0.3)", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 5px 14px rgba(245,193,0,0.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(245,193,0,0.3)"; }}
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 24px", borderTop: "1px solid #f0ede6", background: "#fafaf8" }}>
          <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, margin: 0 }}>
            Showing <strong style={{ color: "#374151" }}>{tests.length === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1}–{Math.min(currentPage * recordsPerPage, tests.length)}</strong> of <strong style={{ color: "#374151" }}>{tests.length}</strong>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <PBtn onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={14} /></PBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PBtn key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>{p}</PBtn>
            ))}
            <PBtn onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={14} /></PBtn>
          </div>
        </div>
      </div>

      {selectedTest && <TestDetailModal test={selectedTest} onClose={() => setSelectedTest(null)} />}
    </>
  );
};

const PBtn = ({ children, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{ width: 30, height: 30, borderRadius: 8, border: active ? "none" : "1.5px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: active ? "#1a0f00" : "#6b7280", background: active ? "linear-gradient(135deg,#f5c100,#e6a800)" : "#fff", boxShadow: active ? "0 2px 8px rgba(245,193,0,0.35)" : "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
  >{children}</button>
);

export default TestTable;