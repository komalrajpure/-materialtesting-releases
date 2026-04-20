"use client";

import { BarChart3, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchDashboardData } from "../../../services/api";

const HomePage = () => {
  const [dashboardData, setDashboardData] = useState({
    monthlyReports: 0,
    yearlyPayment: 0
  });
  const [reports, setReports] = useState([]);
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
   useEffect(() => {

    const loadDashboard = async () => {

      try {

       const data = await fetchDashboardData();

console.log("Dashboard API:", data);

const items = data.totalTest?.items || [];

const currentYear = new Date().getFullYear();

const monthlyReports = items.filter((item) => {

  const rawDate =
    item._createdDate ||
    item.createdDate ||
    item._updatedDate ||
    item.date ||
    item._createdDate?.$date;

  if (!rawDate) return false;

  const reportDate = new Date(rawDate);

  if (isNaN(reportDate)) return false;

  console.log("REPORT DATE:", reportDate);

 return (
  reportDate.getMonth() === selectedMonth &&
  reportDate.getFullYear() === currentYear
);

});
const yearlyItems = items.filter((item) => {

  const rawDate =
    item._createdDate?.$date ||
    item._createdDate ||
    item.createdDate ||
    item.date ||
    item.createdAt;

  if (!rawDate) return false;

  const reportDate = new Date(rawDate);

  if (isNaN(reportDate.getTime())) return false;

  return reportDate.getFullYear() === currentYear;

});

const yearlyAmount = yearlyItems.reduce(
  (sum, item) =>
  sum + (
    item.totalAmount ||
    item.workOrderAmount ||
    item.amount ||
    0
  ),
  0
);

setReports(monthlyReports);

setDashboardData({
  monthlyReports: monthlyReports.length,
  yearlyPayment: yearlyAmount
});
      } catch (err) {
        console.error("Dashboard error:", err);
      }

    };

    loadDashboard();

  }, [selectedMonth]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Welcome banner */}
    <div
  style={{
    borderRadius: 16,
    padding: "20px 24px",
    background: "#fff",
    border: "1px solid #f0ede6",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
  }}
>
        {/* Decorative orb */}
    

        <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(0,0,0,0.45)", marginBottom: 8 }}>
          Welcome back 👋
        </p>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a0f00", letterSpacing: "-.4px", margin: "0 0 8px" }}>
          bookURtest Portal
        </h2>
        <p
  style={{
    fontSize: 14,
    color: "#4b5563",
    fontWeight: 500,
    margin: 0,
    maxWidth: 520,
    lineHeight: 1.6
  }}
>
          Manage civil construction material testing, submit reports, and track approvals — all in one place.
        </p>
      </div>

      
      {/* Analytics Section */}
<div>
  <p
    style={{
      fontSize: 10,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: ".18em",
      color: "#374151",
      marginBottom: 12
    }}
  >
    Analytics
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }}
  >

    {/* Monthly Analysis */}
    <div
      style={{
        borderRadius: 16,
        padding: "20px 22px",
        background: "#fff",
        border: "1px solid #f0ede6",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent:"space-between", marginBottom: 10 }}>
  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
    <BarChart3 size={18} color="#b45309" />
    <span style={{ fontWeight: 800, fontSize: 13 }}>Monthly Analysis</span>
  </div>

  <select
    value={selectedMonth}
    onChange={(e)=>setSelectedMonth(Number(e.target.value))}
    style={{
      padding:"4px 8px",
      fontSize:12,
      borderRadius:6,
      border:"1px solid #e5e7eb"
    }}
  >
    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
      .map((m,i)=>(
        <option key={i} value={i}>{m}</option>
      ))}
  </select>
</div>

      <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
        Test reports submitted this month
      </p>
<h3 style={{ fontSize: 26, fontWeight: 900, color: "#111" }}>
  {dashboardData.monthlyReports}
</h3>

{reports.length > 0 && (
  <div style={{ marginTop: 16 }}>
    {reports.map((item, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 0",
          borderBottom: "1px solid #f3f4f6"
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {item.workName}
        </span>

        <span style={{ fontSize: 12, fontWeight: 700, color: "#b45309" }}>
         ₹{item.totalAmount || item.workOrderAmount || item.amount}
        </span>
      </div>
    ))}
  </div>
)}

</div> {/* ❗ Monthly Analysis card close */}

    {/* Yearly Payment */}
    <div
      style={{
        borderRadius: 16,
        padding: "20px 22px",
        background: "#fff",
        border: "1px solid #f0ede6",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Calendar size={18} color="#166534" />
        <span style={{ fontWeight: 800, fontSize: 13 }}>Yearly Payment</span>
      </div>

      <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
        Total payments this year
      </p>

    <h3 style={{ fontSize: 26, fontWeight: 900, color: "#111" }}>
  ₹{dashboardData.yearlyPayment.toLocaleString()}
</h3>
    </div>

  </div>
</div>

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ borderRadius: 16, padding: "20px 22px", background: "#fff", border: "1px solid #f0ede6", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".15em", color: "#374151", marginBottom: 10 }}>About bookURtest</p>
          <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7, margin: 0 }}>
            A dedicated platform for civil contractors to submit material test samples, track lab reports, and get approvals from senior engineers — streamlining the entire QC workflow.
          </p>
        </div>
        <div style={{ borderRadius: 16, padding: "20px 22px", background: "#fff", border: "1px solid #f0ede6", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".15em", color: "#374151", marginBottom: 10 }}>How it works</p>
          {["Submit test samples via Add Test", "Lab processes and uploads results", "Senior engineer reviews and approves", "Download final certified report"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 3 ? 8 : 0 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fffbeb", border: "1.5px solid #fde68a", fontSize: 9, fontWeight: 900, color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              <span style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomePage;