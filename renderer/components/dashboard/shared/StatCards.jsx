import { TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";

const StatCards = ({ tests = [] }) => {
  const total    = tests.length;
const approved = tests.filter(t => t.status?.toLowerCase() === "approved").length;

const rejected = tests.filter(t => t.status?.toLowerCase() === "rejected").length;

const pending = tests.filter(t => t.status?.toLowerCase() === "pending").length;

  const cards = [
  {
    label: "Total Tests",
    value: total,
    icon: TrendingUp,
    iconColor: "#b45309",
    iconBg: "#ffffff",
    cardBg: "#fffbeb",
    borderColor: "#facc15",
    sub: "All submissions",
  },
  {
    label: "Approved",
    value: approved,
    icon: CheckCircle,
    iconColor: "#166534",
    iconBg: "#ffffff",
    cardBg: "#f0fdf4",
    borderColor: "#22c55e",
    sub: "Reports cleared",
  },
  {
    label: "Pending Review",
    value: pending,
    icon: Clock,
    iconColor: "#9a3412",
    iconBg: "#ffffff",
    cardBg: "#fff7ed",
    borderColor: "#fb923c",
    sub: "Awaiting approval",
  },
  {
    label: "Rejected",
    value: rejected,
    icon: AlertCircle,
    iconColor: "#991b1b",
    iconBg: "#ffffff",
    cardBg: "#fef2f2",
    borderColor: "#ef4444",
    sub: "Flagged reports",
  },
];
 

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
      style={{
  background: card.cardBg,
  borderRadius: 16,
 padding: "20px 24px",
minHeight: 90,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  border: `1.5px solid ${card.borderColor}`,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
}}
        
          >
            {/* Glow orb */}
        

            {/* Left: icon + labels */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
              <div style={{width: 44,
height: 44, borderRadius: 12, background: "#ffffff",
border: `1px solid ${card.borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17} color={card.iconColor} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".16em", color: card.iconColor, lineHeight: 1.2 }}>{card.label}</div>
                <div style={{ fontSize: 10, fontWeight: 500, color: "#9ca3af", marginTop: 2 }}>{card.sub}</div>
              </div>
            </div>

            {/* Right: number */}
            <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1, letterSpacing: -1, color: "#111827", fontFamily: "'Georgia',serif", position: "relative", zIndex: 1, flexShrink: 0, marginLeft: 8 }}>
              {card.value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;