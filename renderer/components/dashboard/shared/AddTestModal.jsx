import { useState, useEffect } from "react";
import { Plus, X, FlaskConical, Ruler, IndianRupee, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { addTest } from "../../../services/api";


// ── Plain text Field ─────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, value, onChange, type = "text", placeholder = "", readOnly = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
   <label style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".15em", color: "#1f2937" }}>{label}</label>
    <div style={{ position: "relative" }}>
      <Icon size={14} color="#d1d5db" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        style={{ width: "100%", padding: "10px 12px 10px 34px", borderRadius: 10, border: "1.5px solid #f0ede6", fontSize: 13, fontWeight: 600, color: "#111", background: readOnly ? "#fafaf8" : "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s" }}
        onFocus={(e) => { if (!readOnly) e.target.style.borderColor = "#f5c100"; }}
        onBlur={(e)  => (e.target.style.borderColor = "#f0ede6")}
      />
    </div>
  </div>
);

// ── Dropdown Field ───────────────────────────────────────────────────────────
const SelectField = ({
  label,
  icon: Icon,
  value,
  onChange,
  options = [],
  loading = false,
  placeholder = "Select...",
  disabled = false,
  disabledMessage = ""
}) => {

  const [hover,setHover] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

      <label style={{
        fontSize:10,
        fontWeight:900,
        textTransform:"uppercase",
        letterSpacing:".15em",
        color:"#1f2937"
      }}>
        {label}
      </label>

      <div
        style={{ position:"relative" }}
        onMouseEnter={()=>disabled && setHover(true)}
        onMouseLeave={()=>setHover(false)}
      >

        <Icon size={14} color="#d1d5db"
          style={{
            position:"absolute",
            left:12,
            top:"50%",
            transform:"translateY(-50%)",
            pointerEvents:"none",
            zIndex:1
          }}
        />

        <ChevronDown size={13} color="#d1d5db"
          style={{
            position:"absolute",
            right:12,
            top:"50%",
            transform:"translateY(-50%)",
            pointerEvents:"none"
          }}
        />

        <select
          value={value}
          onChange={onChange}
          disabled={loading || disabled}
          style={{
            width:"100%",
            padding:"10px 34px",
            borderRadius:10,
            border:"1.5px solid #f0ede6",
            fontSize:13,
            fontWeight:600,
            background:"#fff",
            appearance:"none",
            cursor: loading ? "not-allowed":"pointer"
          }}
        >

          <option value="" disabled>
            {loading ? "Loading..." : placeholder}
          </option>

          {options.map((opt,i)=>(
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}

        </select>

        {hover && disabled && (
          <div style={{
            marginTop:4,
            fontSize:11,
            color:"#dc2626",
            fontWeight:700
          }}>
            {disabledMessage}
          </div>
        )}

      </div>
    </div>
  );
};
// ── Add / Edit Modal ─────────────────────────────────────────────────────────
// materialOptions: [{ label, value, test, unit, price }]  — value === title
const AddTestModal = ({ onClose, onSave, editData, materialOptions, materialsLoading, materialsError }) => {
  const blank = { material: "", test: "", unit: "", expiredDate: "", amount: "" };
  const [form,       setForm]       = useState(editData ? { ...editData, amount: editData.amount ?? "" } : blank);
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState("");
const [selectedTest, setSelectedTest] = useState("");
const [govtPrice, setGovtPrice] = useState(null);

useEffect(() => {
  if (editData) {

    const formattedDate = editData.expiredDate
      ? new Date(editData.expiredDate).toISOString().split("T")[0]
      : "";

    setSelectedMaterial(editData.material);
    setSelectedTest(editData.test);

    setForm({
      material: editData.material,
      test: editData.test,
      unit: editData.unit,
      expiredDate: formattedDate,
      amount: editData.amount ?? ""
    });
  }
}, [editData]);
  // When a material title is picked, auto-fill test / unit / price from the option's extra fields
 
// 🔥 Unique materials (like District list)
const uniqueMaterials = [
  ...new Map(
    materialOptions.map(item => [item.value, item])
  ).values()
];

// 🔥 Tests based on selected material
const relatedTests = materialOptions.filter(
  item => item.value === selectedMaterial
);// 🔥 Units based on selected test
const relatedUnits = materialOptions
  .filter(
    item =>
      item.value === selectedMaterial &&
      item.test === selectedTest
  )
  .map(item => ({
    label: item.unit,
    value: item.unit
  }));

// 🔥 When test selected → set unit + govt price
useEffect(() => {
  if (!selectedMaterial || !selectedTest) return;

  const match = materialOptions.find(
    item =>
      item.value === selectedMaterial &&
      item.test === selectedTest
  );

  if (match) {
    setForm(f => ({
      ...f,
      unit: match.unit
    }));

    setGovtPrice(match.price);
  }

}, [selectedMaterial, selectedTest]);
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

const handleSave = async () => {
  if (editData && !form.expiredDate) {
    setApiError("Expiry date is required.");
    return;
  }
  if (!selectedMaterial || !selectedTest) {
    setApiError("Please select Material and Test.");
    return;
  }

  setSubmitting(true);
  setApiError(null);
  try {
    // ✅ Use entered amount, or fall back to govt price
    const finalPrice = form.amount !== "" ? form.amount : govtPrice;

    await addTest({
      material: form.material,
      test: form.test,
      unit: form.unit,
      price: finalPrice,   // 👈 this line changed
      expiredDate: form.expiredDate
    });

    onSave({ ...form, amount: finalPrice });
    onClose();
  } catch (err) {
    setApiError(err.message || "Failed to save. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "40%", borderRadius: 20, background: "#fff", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", border: "1px solid #f0ede6", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f0ede6", background: "linear-gradient(90deg,#fffdf0,#fff)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fffbeb", border: "1.5px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FlaskConical size={18} color="#b45309" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#111", margin: 0 }}>{editData ? "Edit Test" : "Add Your Test"}</h2>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontWeight: 500 }}>Add Testing Material</p>
            </div>
          </div>
          <button
            onClick={onClose} disabled={submitting}
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#374151"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#9ca3af"; }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Submit error */}
         {apiError && (
  <div style={{
    borderRadius: 12,
    padding: "12px 16px",
    background: "#fef2f2",
    border: "1.5px solid #fecaca",
    fontSize: 13,
    color: "#dc2626",
    fontWeight: 700,
    boxShadow: "0 4px 14px rgba(220,38,38,0.15)"
  }}>
    ⚠ {apiError}
  </div>
)}

          {/* Fetch error */}
          {materialsError && (
            <div style={{ borderRadius: 10, padding: "10px 14px", background: "#fef2f2", border: "1.5px solid #fecaca", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
              ⚠ Failed to load materials from API. Type manually.
            </div>
          )}

          {/* Material dropdown */}
{materialsError ? (
  <Field
    label="Add Testing Material"
    icon={FlaskConical}
    value={form.material}
    onChange={upd("material")}
    placeholder="e.g. Basic test of cement"
  />
) : (
 <SelectField
  label="Add Testing Material"
  icon={FlaskConical}
  disabled={editData}
  disabledMessage="it not editable only price will be editable"
    value={selectedMaterial}
    onChange={(e) => {
      const value = e.target.value;

      setSelectedMaterial(value);

      setForm(f => ({
        ...f,
        material: value,
        test: "",
        unit: "",
        amount: ""
      }));

      setSelectedTest("");
      setGovtPrice(null);
    }}
    options={uniqueMaterials.map(m => ({
      label: m.label,
      value: m.value
    }))}
    loading={materialsLoading}
    placeholder={
      materialsLoading
        ? "Loading materials..."
        : "Select material..."
    }
  />
)}

{/* Test dropdown */}
<SelectField
  label="Add Test"
  icon={FlaskConical}
  disabled={editData}
  disabledMessage="it not editable only price will be editable"
  value={selectedTest}
  onChange={(e) => {
    setSelectedTest(e.target.value);
    setForm(f => ({ ...f, test: e.target.value }));
  }}
  options={relatedTests.map(t => ({
    label: t.test,
    value: t.test
  }))}
  loading={!selectedMaterial}
  placeholder={
    selectedMaterial
      ? "Select test..."
      : "Select material first..."
  }
/>

<SelectField
  label="Test Unit"
  icon={Ruler}
  disabled={editData}
  disabledMessage="it not editable only price will be editable"
  value={form.unit}
  onChange={(e) =>
    setForm(f => ({ ...f, unit: e.target.value }))
  }
  options={relatedUnits}
  loading={!selectedTest}
  placeholder={
    selectedTest
      ? "Select unit..."
      : "Select test first..."
  }
/>

<Field
  label="Expire Date"
  icon={Calendar}
  value={form.expiredDate}
  onChange={upd("expiredDate")}
  type="date"
/>

<Field
  label="Test Amount (₹)"
  icon={IndianRupee}
  value={form.amount}
  onChange={upd("amount")}
  type="number"
  placeholder="Leave blank for govt. price"
/>

{govtPrice && (
  <div style={{
    marginTop: 8,
    padding: "8px 12px",
    borderRadius: 8,
    background: "#fffbeb",
    border: "1.5px solid #fde68a",
    fontSize: 12,
    fontWeight: 700,
    color: "#92400e"
  }}>
    Govt Approved Price: ₹{Number(govtPrice).toLocaleString("en-IN")}
  </div>
)}
          
          {/* Note */}
          <div style={{ borderRadius: 10, padding: "11px 14px", background: "#fffbeb", border: "1.5px solid #fde68a", display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 14, marginTop: 1 }}>💡</span>
            <p style={{ fontSize: 11, color: "#92400e", fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
              If you haven't set a price, the government-approved price will be applied automatically.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "14px 24px", borderTop: "1px solid #f0ede6", background: "#fafaf8" }}>
          <button onClick={onClose} disabled={submitting} style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, fontWeight: 700, color: "#6b7280", background: "#fff", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={submitting}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 10, fontSize: 12, fontWeight: 800, background: "linear-gradient(135deg,#f5c100,#e6a800)", color: "#1a0f00", border: "none", cursor: submitting ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(245,193,0,0.35)", opacity: submitting ? 0.75 : 1 }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.opacity = ".88"; }}
            onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.opacity = "1"; }}
          >
            {submitting
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
              : <>{editData ? "Update Test" : "Save Test"}</>
            }
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

export default AddTestModal;