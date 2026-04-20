// components/dashboard/AddTestPage.jsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { fetchMaterials, fetchTestData, deleteTest } from "../../../services/api";
import AddTestModal from "../shared/AddTestModal";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

// ── Main Page ────────────────────────────────────────────────────────────────
const AddTestPage = () => {
  // Table rows (loaded from API)
 
  const [rows,         setRows]         = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError,   setTableError]   = useState(null);

  // Modal
 const [showModal, setShowModal] = useState(false);
const [editRow,   setEditRow]   = useState(null);
const [deleteId, setDeleteId] = useState(null);

  // Material dropdown options
  const [memberOptions,  setMemberOptions]  = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError,   setMembersError]   = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

 const showToast = (type, msg) => {
  setToast({ type, msg });

  setTimeout(() => {
    setToast(null);
  }, 3000);
};
  // ── Fetch tests from API ─────────────────────────────────────────────────
  useEffect(() => {
    const loadTests = async () => {
      setTableLoading(true);
      setTableError(null);
      try {
        const items = await fetchTestData();
        // Map API fields → table row shape
        // API: { _id, title, test, unit, price, _updatedDate, expiredDate }
        setRows(
  items.map((item) => ({
    id: item._id || item.id,

    material:
      item.title ||
      item.material ||
      item.name ||
      "N/A",

    test:
      item.test ||
      item.testName ||
      "N/A",

    unit:
      item.unit ||
      item.unitName ||
      "N/A",

    amount:
      item.price ??
      item.amount ??
      null,

    updatedDate:
      item._updatedDate?.slice(0, 10) ||
      item.updatedDate ||
      "",

    expiredDate:
      item.expiredDate ||
      ""
  }))
);
      } catch (err) {
        console.error("❌ fetchTestData error:", err.message);
        setTableError(err.message);
      } finally {
        setTableLoading(false);
      }
    };
    loadTests();
  }, []);

  // ── Fetch material dropdown options ──────────────────────────────────────
useEffect(() => {
  const loadMaterials = async () => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const materials = await fetchMaterials();

      // 🔥 Store full raw data
     setMemberOptions(
  materials.map((item) => ({
    label: item.title,
    value: item.title,
    test: item.test,
    unit: item.unit,
    price: item.price,
  }))
);

    } catch (err) {
      setMembersError(err.message);
    } finally {
      setMembersLoading(false);
    }
  };

  loadMaterials();
}, []);

  // ── Called by AddTestModal after successful API save ─────────────────────
  // Modal handles the POST /add_test call itself; this just updates local state.
  const handleSave = (form) => {

  if (editRow) {

    setRows((r) =>
      r.map((row) =>
        row.id === editRow.id
          ? {
              ...row,
              material: form.material,
              test: form.test,
              unit: form.unit,
              amount: form.amount ? Number(form.amount) : null,
              updatedDate: new Date().toISOString().slice(0, 10),
              expiredDate: form.expiredDate,
            }
          : row
      )
    );

    showToast("success", "Test updated successfully.");

  } else {

    setRows((r) => [
      {
        id: Date.now(),
        material: form.material,
        test: form.test,
        unit: form.unit,
        amount: form.amount ? Number(form.amount) : null,
        updatedDate: new Date().toISOString().slice(0, 10),
        expiredDate: form.expiredDate,
      },
      ...r,
    ]);

    showToast("success", "Test added successfully.");

  }

  setEditRow(null);
  setShowModal(false);

};

  const handleEdit   = (row) => { setEditRow(row); setShowModal(true); };
const handleDelete = async (id) => {
  if (!id) {
    console.warn("handleDelete called with no id");
    return;
  }
  try {
    console.log("Deleting ID:", id);
    await deleteTest(id);
    setRows((r) => r.filter((row) => row.id !== id));
    showToast("success", "Test deleted successfully.");
  } catch (err) {
    console.error("❌ Delete failed:", err.message);
    showToast("error", "Delete failed: " + err.message);
  }
};
  const openAdd = () => { setEditRow(null); setShowModal(true); };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:     "fixed",
          top:          24,
          right:        24,
          zIndex:       9999,
          padding:      "11px 18px",
          borderRadius: 12,
          fontSize:     12,
          fontWeight:   700,
          boxShadow:    "0 8px 30px rgba(0,0,0,0.12)",
          border: `1.5px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          background:   toast.type === "success" ? "#f0fdf4" : "#fef2f2",
          color:        toast.type === "success" ? "#15803d" : "#dc2626",
          animation:    "toastIn 0.2s ease",
        }}>
          {toast.type === "success" ? "✅" : "🗑"} {toast.msg}
        </div>
      )}

      <div style={{
        borderRadius: 16,
        overflow:     "hidden",
        background:   "#fff",
        border:       "1px solid #f0ede6",
        boxShadow:    "0 4px 24px rgba(0,0,0,0.06)",
      }}>

        {/* ── Card Header ── */}
        <div style={{
          padding:        "18px 24px",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          borderBottom:   "1px solid #f0ede6",
          background:     "linear-gradient(90deg,#fffdf5,#fff)",
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 900, color: "#111", margin: 0 }}>
              Test Catalogue
            </h2>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontWeight: 500 }}>
              Manage your material tests and pricing
            </p>
          </div>
          <button
            onClick={openAdd}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          7,
              padding:      "9px 18px",
              borderRadius: 11,
              fontSize:     12,
              fontWeight:   800,
              background:   "linear-gradient(135deg,#f5c100,#e6a800)",
              color:        "#1a0f00",
              border:       "none",
              cursor:       "pointer",
              boxShadow:    "0 4px 14px rgba(245,193,0,0.35)",
              whiteSpace:   "nowrap",
              transition:   "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = ".88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={14} /> Add New Test
          </button>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafaf8", borderBottom: "2px solid #f0ede6" }}>
                {["Material", "Test", "Unit", "Amount", "Updated Date", "Expired Date", "Edit", "Delete"].map((h) => (
                  <th key={h} style={{
                    padding:       "11px 20px",
                    textAlign:     "left",
                    fontSize:      9,
                    fontWeight:    900,
                    textTransform: "uppercase",
                    letterSpacing: ".15em",
                    color:         "#9ca3af",
                    whiteSpace:    "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>

              {/* Loading state */}
              {tableLoading && (
                <tr>
                  <td colSpan={8} style={{ padding: 56, textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9ca3af", fontSize: 13 }}>
                      <Loader2 size={18} color="#f5c100" style={{ animation: "spin 1s linear infinite" }} />
                      Loading tests…
                    </div>
                  </td>
                </tr>
              )}

              {/* Error state */}
              {!tableLoading && tableError && (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
                    ⚠ {tableError}
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!tableLoading && !tableError && rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                    No tests added yet. Click <strong>Add New Test</strong> to get started.
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!tableLoading && !tableError && rows.map((row, i) => {
                const expired = row.expiredDate && new Date(row.expiredDate) < new Date();
                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: "1px solid #f5f4f0",
                      background:   i % 2 === 1 ? "#fdfdf9" : "#fff",
                      transition:   "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,193,0,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 1 ? "#fdfdf9" : "#fff")}
                  >
                    {/* Material */}
                    <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 800, color: "#111", whiteSpace: "nowrap" }}>
                      {row.material}
                    </td>

                    {/* Test */}
                    <td style={{ padding: "13px 20px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>
                      {row.test}
                    </td>

                    {/* Unit */}
                    <td style={{ padding: "13px 20px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: "#f3f4f6", color: "#374151" }}>
                        {row.unit}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 900, color: "#111", whiteSpace: "nowrap" }}>
                      {row.amount != null
                        ? `₹${Number(row.amount).toLocaleString("en-IN")}`
                        : (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>
                            Govt. Price
                          </span>
                        )
                      }
                    </td>

                    {/* Updated Date */}
                    <td style={{ padding: "13px 20px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                      {fmt(row.updatedDate)}
                    </td>

                    {/* Expired Date */}
                    <td style={{ padding: "13px 20px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize:     11,
                        fontWeight:   700,
                        padding:      "3px 9px",
                        borderRadius: 6,
                        background:   expired ? "#fef2f2" : "#f0fdf4",
                        color:        expired ? "#dc2626" : "#16a34a",
                        border:       `1px solid ${expired ? "#fecaca" : "#bbf7d0"}`,
                      }}>
                        {fmt(row.expiredDate)}
                      </span>
                    </td>

                    {/* Edit */}
                    <td style={{ padding: "13px 20px" }}>
                      <button
                        onClick={() => handleEdit(row)}
                        title="Edit"
                        style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid #fde68a", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fef3c7")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fffbeb")}
                      >
                        <Pencil size={13} color="#b45309" />
                      </button>
                    </td>

                    {/* Delete */}
                    <td style={{ padding: "13px 20px" }}>
                      <button
                        onClick={() => setDeleteId(row.id)}
                        title="Delete"
                        style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fef2f2")}
                      >
                        <Trash2 size={13} color="#dc2626" />
                      </button>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: "11px 24px", borderTop: "1px solid #f0ede6", background: "#fafaf8" }}>
          <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, margin: 0 }}>
            {tableLoading
              ? "Loading…"
              : <>
                  <strong style={{ color: "#374151" }}>{rows.length}</strong>
                  {" "}test{rows.length !== 1 ? "s" : ""} in catalogue
                </>
            }
          </p>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <AddTestModal
          onClose={() => { setShowModal(false); setEditRow(null); }}
          onSave={handleSave}
          editData={editRow}
          materialOptions={memberOptions}
          materialsLoading={membersLoading}
          materialsError={membersError}
        />
      )}
      {deleteId && (
  <div style={{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,0.45)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    zIndex:100
  }}>
    <div style={{
  background:"#fff",
  padding:"36px 40px",
  borderRadius:"18px",
  width:"420px",
  textAlign:"center",
  boxShadow:"0 18px 60px rgba(0,0,0,0.25)"
}}>
      <h3 style={{marginBottom:10,fontWeight:800,fontSize:18}}>Confirm to delete?</h3>

      <p style={{fontSize:14,color:"#6b7280"}}>
        It will be removed permanently.
      </p>

      <div style={{
        display:"flex",
        gap:12,
        marginTop:22,
        justifyContent:"center"
      }}>

        <button
          onClick={()=>setDeleteId(null)}
          style={{
          padding:"10px 22px",
            borderRadius:10,
            border:"1px solid #e5e7eb",
            background:"#fff",
            fontWeight:600,
            cursor:"pointer"
          }}
        >
          Cancel
        </button>

        <button
onClick={async () => {
  const idToDelete = deleteId;   // capture it before clearing
  setDeleteId(null);             // close modal first
  await handleDelete(idToDelete); // then delete with captured id
}}
          style={{
            padding:"8px 18px",
            borderRadius:10,
            background:"#dc2626",
            color:"#fff",
            border:"none",
            fontWeight:700,
            cursor:"pointer"
          }}
        >
          Delete
        </button>

      </div>
    </div>
  </div>
)}

      <style>{`
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

export default AddTestPage;