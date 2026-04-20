import {
  Home,
  User,
  LayoutDashboard,
  Plus,
  FileCheck,
  LogOut,
  HardHat,
  Menu,
  ChevronLeft,
  UserPlus,
} from "lucide-react";

const DashboardSidebar = ({
  isCollapsed,
  setIsCollapsed,
  activePage,
  setActivePage,
  user,
  onLogout,
   setShowPopup,   // ⭐ ADD THIS
}) => {
  // ⭐ GET USER TYPE FROM LOCALSTORAGE
const userData = JSON.parse(localStorage.getItem("user_data") || "{}");

const rawType =
  userData.type ||
  userData.role ||
  userData.userType ||
  "";

const userType = String(rawType).trim().toLowerCase();

const isInspector = userType === "inspector";

console.log("USER TYPE:", userType);

  console.log("🔍 User Type:", userType);
  console.log("👤 User Data:", userData);

  // ⭐ BUILD MENU BASED ON TYPE
  let menuItems = [];

if (userType === "inspector") {
  menuItems = [
    { label: "My Account", icon: User, pageKey: "account" },
    { label: "Report Approval", icon: FileCheck, pageKey: "approval" },
  ];
} else {
  menuItems = [
    { label: "Home", icon: Home, pageKey: "home" },
    { label: "My Account", icon: User, pageKey: "account" },
    { label: "Dashboard", icon: LayoutDashboard, pageKey: "dashboard" },
    { label: "Add Member", icon: UserPlus, pageKey: "add-member" },
    { label: "Add Test", icon: Plus, pageKey: "add-test" },
  ];
}

const handleNavigation = async (pageKey) => {
  try {
    // ✅ Always fetch fresh status from API on every navigation
    const token = localStorage.getItem("auth_token");
    const response = await fetch("https://www.bookurtest.com/_functions/membersStatus", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const stored = JSON.parse(localStorage.getItem("user_data") || "{}");
    const profile = Array.isArray(data)
      ? data.find(u => u._id === stored._id || u.id === stored._id) || data[0]
      : data;

    const rawStatus = profile?.approvalStatus ?? profile?.status ?? "";
    const isNowApproved = String(rawStatus).toLowerCase().trim() === "approved";

    // ✅ Update localStorage with fresh status
    localStorage.setItem("user_data", JSON.stringify({ ...stored, approvalStatus: rawStatus }));

    if (!isNowApproved && pageKey !== "account") {
      setShowPopup(true);
      return;
    }

    setActivePage(pageKey);

  } catch (err) {
    // Fallback to localStorage on error
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
    const status = String(userData.approvalStatus || "").toLowerCase();
    if (status !== "approved" && pageKey !== "account") {
      setShowPopup(true);
      return;
    }
    setActivePage(pageKey);
  }
};
  const sidebarWidth = isCollapsed ? 72 : 240;

  return (
    <>
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: `${sidebarWidth}px`,
          background: "linear-gradient(170deg, #f5c100 0%, #e6a800 100%)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
          zIndex: 1000,
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          userSelect: "none",
        }}
      >
        {/* TOP SECTION */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "50px",
            paddingBottom: "10px",
            position: "relative",
            width: "100%",
          }}
        >
          {/* TOGGLE BUTTON */}
          <button
  onClick={() => setIsCollapsed(!isCollapsed)}
  style={{
    position: "fixed",
    top: "10px",

    // ⭐ MAIN FIX
    left: isCollapsed ? "20px" : "240px",

    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "#000",
    border: "none",
    cursor: "pointer",
    zIndex: 2000,
    transition: "left 0.3s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)"
  }}
>
            {isCollapsed ? (
              <Menu size={16} color="white" />
            ) : (
              <ChevronLeft size={16} color="white" />
            )}
          </button>

          <div style={{ height: isCollapsed ? "8px" : "24px" }} />

          {/* LOGO */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              width: isCollapsed ? "40px" : "64px",
              height: isCollapsed ? "40px" : "64px",
              transition: "all 0.3s ease",
            }}
          >
            <HardHat size={isCollapsed ? 20 : 32} color="#e6a800" />
          </div>

          {!isCollapsed && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: "900",
                  color: "#111",
                  margin: "0",
                  lineHeight: 1.2,
                }}
              >
                bookURtest
              </h1>
              <p
                style={{
                  fontSize: "10px",
                  color: "rgba(0,0,0,0.5)",
                  marginTop: "4px",
                  letterSpacing: "0.2em",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Material Testing
              </p>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav
          style={{
            flex: 1,
            marginTop: isCollapsed ? "10px" : "32px",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: isCollapsed ? "18px" : "4px",
            overflowY: "auto",
          }}
        >
          {menuItems.map((item) => {
            const isActive = activePage === item.pageKey;

            return (
              <button
                key={item.pageKey}
                onClick={() => {
                  window.getSelection()?.removeAllRanges();
                  handleNavigation(item.pageKey);
                }}
                onMouseDown={(e) => e.preventDefault()}
                title={isCollapsed ? item.label : ""}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: isCollapsed ? 0 : "12px",
                  borderRadius: "12px",
                  padding: isCollapsed ? "12px" : "12px 16px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  height: "48px",
                  transition: "all 0.2s",
                  userSelect: "none",
                  outline: "none",
                  WebkitTapHighlightColor: "transparent",
                  boxShadow: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <item.icon
                  size={20}
                  color={isActive ? "#d97706" : "rgba(0,0,0,0.6)"}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {!isCollapsed && (
                  <>
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontWeight: "700",
                        fontSize: "14px",
                        color: isActive ? "#d97706" : "rgba(0,0,0,0.7)",
                        userSelect: "none",
                      }}
                    >
                      {item.label}
                    </span>

                    {isActive && (
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#f59e0b",
                        }}
                      />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div
          style={{
            padding: "16px",
            marginTop: "auto",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {!isCollapsed && user?.name && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#111",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  color: "rgba(0,0,0,0.5)",
                  margin: "2px 0 0 0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: "500",
                }}
              >
                {user.email}
              </p>
            </div>
          )}

          <button
            onClick={onLogout}
            title={isCollapsed ? "Logout" : ""}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? 0 : "12px",
              borderRadius: "12px",
              padding: isCollapsed ? "12px" : "12px 16px",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              height: "48px",
              justifyContent: isCollapsed ? "center" : "flex-start",
              transition: "all 0.2s",
              color: "#991b1b",
              fontSize: "14px",
              fontWeight: "700",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ef5350";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#991b1b";
            }}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>

          {!isCollapsed && (
            <p
              style={{
                fontSize: "10px",
                color: "rgba(0,0,0,0.3)",
                textAlign: "center",
                fontWeight: "700",
                margin: 0,
              }}
            >
              © 2026 BOOKURTEST
            </p>
          )}
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;