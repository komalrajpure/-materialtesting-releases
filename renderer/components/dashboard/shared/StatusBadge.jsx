import { AlertCircle } from "lucide-react";

const statusConfig = {
  Approved: {
    label: "Approved",
    bg: "#f0fdf4",
    color: "#15803d",
    border: "#bbf7d0",
    dot: "#22c55e"
  },

  Sent: {
    label: "Sent",
    bg: "#f0fdf4",
    color: "#15803d",
    border: "#bbf7d0",
    dot: "#22c55e"
  },

  "In-process": {
    label: "In-process",
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
    dot: "#3b82f6"
  },

  Rejected: {
    label: "Rejected",
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fecaca",
    dot: "#ef4444",
    showAlert: true
  },

  Pending: {
    label: "Pending",
    bg: "#fffbeb",
    color: "#b45309",
    border: "#fde68a",
    dot: "#f59e0b"
  },
};

const StatusBadge = ({ status, rejectionReason }) => {
  const config = statusConfig[status] ?? statusConfig["Pending"];

  return (<div style={{ position: "relative", display: "inline-block" }} className="group">
      
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          borderRadius: 8,
          fontSize: 10,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          background: config.bg,
          color: config.color,
          border: `1.5px solid ${config.border}`,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: config.dot,
            flexShrink: 0
          }}
        />
        {config.label}

        {config.showAlert && rejectionReason && (
          <AlertCircle size={11} style={{ marginLeft: 2 }} />
        )}
      </span>
{config.showAlert && rejectionReason && (
  <div
    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    style={{
      position: "absolute",
      top: "120%",
      left: "50%",
      transform: "translateX(-50%)",

      background: "#8b1e1e",
      color: "#fee2e2",

      padding: "12px 16px",

      fontSize: 12,
      lineHeight: 1.4,

      borderRadius: 6,

      width: 320,

      border: "1px solid #fecaca",
      boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
      pointerEvents: "none",   

      zIndex: 999
    }}
  >
    {rejectionReason}
  </div>
)}

    </div>
  );
};

export default StatusBadge;