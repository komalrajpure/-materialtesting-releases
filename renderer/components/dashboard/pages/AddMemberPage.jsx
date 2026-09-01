import { useState, useEffect } from "react";
import { Check, Mail, Trash2, User, AlertTriangle } from "lucide-react";
import { emailVerification, emailVerifyOtp, SignupSendOtp } from "../../../services/api";
import { registrationPhoneVerify } from "../../../services/api";
import { checkLabMemberLimit } from "../../../services/api";
import { fetchInspectorByLabName } from "../../../services/api";
import { deleteMember } from "../../../services/api";

const AddMemberPage = () => {
  const [memberData, setMemberData] = useState([]);

  const handleMemberEdit = (e) => {
    setMemberData({
      ...memberData,
      [e.target.name]: e.target.value
    });
  };

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    emailOtp: "",
    phone: "",
    phoneOtp: "",
  });

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [memberExists, setMemberExists] = useState(false);
  const [checkingMember, setCheckingMember] = useState(true);
  const [memberCreated, setMemberCreated] = useState(false);

  const [message, setMessage] = useState({ text: "", type: "" });

  // ✅ Inline delete confirmation state — replaces window.confirm()
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showMsg = (text, type = "error") => setMessage({ text, type });
  const clearMsg = () => setMessage({ text: "", type: "" });

  const handleDeleteMember = async (id) => {
    setDeleting(true);
    try {
      await deleteMember(id);
      setConfirmDeleteId(null);
      window.location.reload();
    } catch (err) {
      showMsg(err.message);
      setConfirmDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const checkMember = async () => {
      try {
        const res = await checkLabMemberLimit();
        if (res && res.allowed === false) {
          setMemberExists(true);
          const inspectors = await fetchInspectorByLabName();
          if (inspectors) {
            setMemberData(inspectors);
          }
        }
      } catch (err) {
      } finally {
        setCheckingMember(false);
      }
    };
    checkMember();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message.text) clearMsg();
  };

  const handleSendEmailOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim() || !form.lastName.trim() || !form.email.trim()) {
      showMsg("Please fill all fields");
      return;
    }
    if (!emailRegex.test(form.email)) {
      showMsg("Enter valid email address");
      return;
    }
    try {
      await emailVerification(form.email);
      setEmailOtpSent(true);
      showMsg("OTP sent to your email", "success");
    } catch (err) {
      showMsg(err.message);
      setEmailOtpSent(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    try {
      await emailVerifyOtp(form.email, form.emailOtp);
      setEmailOtpVerified(true);
      setForm({ ...form, emailOtp: "" });
      clearMsg();
    } catch (err) {
      showMsg(err.message);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (form.phone.length !== 10) {
      showMsg("Please enter valid 10-digit phone number");
      return;
    }
    try {
      const res = await SignupSendOtp(Number(form.phone));
      setPhoneOtpSent(true);
      showMsg("OTP sent to your phone", "success");
    } catch (err) {
      showMsg(err.message);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    try {
      const labData = JSON.parse(localStorage.getItem("user_data"));
      await registrationPhoneVerify({
        phone: Number(form.phone),
        otp: Number(form.phoneOtp),
        name: form.name,
        lastName: form.lastName,
        email: form.email,
        labName: labData.labName,
        type: "inspector"
      });
      setPhoneOtpVerified(true);

      const inspectors = await fetchInspectorByLabName();
      if (inspectors) {
        setMemberData(inspectors);
      }

      setMemberCreated(true);
      clearMsg();
    } catch (err) {
      showMsg(err.message);
    }
  };

  const MessageBanner = () => {
    if (!message.text) return null;
    return (
      <div style={{
        marginTop: 16,
        padding: "12px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        background: message.type === "success" ? "#dcfce7" : "#fee2e2",
        color: message.type === "success" ? "#16a34a" : "#dc2626",
        border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span>{message.type === "success" ? "✓" : "⚠"}</span>
        <span>{message.text}</span>
      </div>
    );
  };

  // Reusable Member Details UI
  const MemberDetailsView = ({ members, isNewlyCreated = false }) => (
    <div style={{ padding: "32px 40px" }}>

      {/* TOP BANNER */}
      {isNewlyCreated ? (
        <div style={{
          background: "#dcfce7",
          border: "1px solid #bbf7d0",
          borderRadius: 14,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Check size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#15803d", margin: 0 }}>Member Created Successfully!</p>
            <p style={{ fontSize: 13, color: "#166534", margin: 0, fontWeight: 500 }}>The inspector account has been activated.</p>
          </div>
        </div>
      ) : (
        <div style={{
          background: "#fef9ec",
          border: "1px solid #fde68a",
          borderRadius: 14,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <User size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#92400e", margin: 0 }}>Member Already Exists</p>
            <p style={{ fontSize: 13, color: "#78350f", margin: 0, fontWeight: 500 }}>Only one member is allowed per lab. To edit, go to <b>My Account</b>.</p>
          </div>
        </div>
      )}

      <MessageBanner />

      {/* MEMBER CARDS */}
      {members.map((m) => (
        <div key={m._id || m.email}>
          <div style={{
            background: "#fff",
            borderRadius: confirmDeleteId === m._id ? "16px 16px 0 0" : 16,
            border: "1.5px solid #e5e7eb",
            borderBottom: confirmDeleteId === m._id ? "none" : "1.5px solid #e5e7eb",
            padding: "24px 28px",
            marginTop: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}>
            {/* AVATAR + NAME */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "#f59e0b", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0
              }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
                  {m.name?.[0]?.toUpperCase()}{m.lastName?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 2px" }}>
                  {m.name} {m.lastName}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0, fontWeight: 500 }}>Inspector</p>
              </div>
            </div>

            {/* EMAIL */}
            <div style={{ flex: 2 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>{m.email}</p>
            </div>

            {/* PHONE */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>{m.phoneNumber}</p>
            </div>

            {/* DELETE BUTTON */}
            {m._id && (
              <button
                onClick={() => setConfirmDeleteId(confirmDeleteId === m._id ? null : m._id)}
                style={{
                  background: confirmDeleteId === m._id ? "#dc2626" : "#fef2f2",
                  color: confirmDeleteId === m._id ? "#fff" : "#dc2626",
                  border: "1.5px solid #fecaca",
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <Trash2 size={15} />
                {confirmDeleteId === m._id ? "Cancel" : "Delete"}
              </button>
            )}
          </div>

          {/* ✅ INLINE CONFIRM DELETE — replaces window.confirm() */}
          {confirmDeleteId === m._id && (
            <div style={{
              background: "#fef2f2",
              border: "1.5px solid #fecaca",
              borderTop: "none",
              borderRadius: "0 0 16px 16px",
              padding: "16px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={18} color="#dc2626" />
                <p style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", margin: 0 }}>
                  Are you sure you want to delete this member?
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleting}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1.5px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteMember(m._id)}
                  disabled={deleting}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "#dc2626",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: deleting ? "not-allowed" : "pointer",
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (checkingMember) {
    return <div style={{ padding: 40 }}>Checking member status...</div>;
  }

  if (memberCreated) {
    return <MemberDetailsView members={memberData} isNewlyCreated={true} />;
  }

  if (memberExists) {
    return <MemberDetailsView members={memberData} isNewlyCreated={false} />;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, padding: "20px" }}>
      {/* MAIN FORM */}
      <div>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0, fontWeight: 500 }}>Complete all verification steps to activate the account</p>
        </div>

        {/* PROGRESS TRACKER */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40, gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, background: "#f59e0b", color: "#fff", marginBottom: 8 }}>1</div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0, textAlign: "center" }}>Identity</p>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", marginTop: 24 }}>
            <div style={{ flex: 1, height: 2, background: emailOtpSent ? "#f59e0b" : "#e5e7eb" }}></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, background: emailOtpSent ? "#f59e0b" : "#e5e7eb", color: emailOtpSent ? "#fff" : "#9ca3af", marginBottom: 8 }}>2</div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0, textAlign: "center" }}>Email Verification</p>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", marginTop: 24 }}>
            <div style={{ flex: 1, height: 2, background: emailOtpVerified ? "#f59e0b" : "#e5e7eb" }}></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, background: emailOtpVerified ? "#f59e0b" : "#e5e7eb", color: emailOtpVerified ? "#fff" : "#9ca3af", marginBottom: 8 }}>3</div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0, textAlign: "center" }}>Phone Verification</p>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", marginTop: 24 }}>
            <div style={{ flex: 1, height: 2, background: phoneOtpVerified ? "#f59e0b" : "#e5e7eb" }}></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, background: phoneOtpVerified ? "#16a34a" : "#e5e7eb", color: phoneOtpVerified ? "#fff" : "#9ca3af", marginBottom: 8 }}>
              {phoneOtpVerified ? <Check size={20} /> : "4"}
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0, textAlign: "center" }}>Activation</p>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div style={{
          background: emailOtpSent && !emailOtpVerified ? "#eff6ff" : "#fff",
          borderRadius: 20,
          border: emailOtpSent && !emailOtpVerified ? "2px solid #dbeafe" : "1.5px solid #e5e7eb",
          padding: "32px",
          marginBottom: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          transition: "all 0.3s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 900 }}>
              {emailOtpSent && !emailOtpVerified ? "2" : "1"}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: 0 }}>
              {emailOtpSent && !emailOtpVerified ? "Verify Your Email" : "Identity Information"}
            </h3>
          </div>

          {/* PHASE 1: DETAILS INPUT */}
          {!emailOtpSent && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 10 }}>Name</label>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #dbeafe", borderRadius: 12, fontSize: 14, fontWeight: 500, outline: "none", background: "#eff6ff", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 10 }}>Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #dbeafe", borderRadius: 12, fontSize: 14, fontWeight: 500, outline: "none", background: "#eff6ff", boxSizing: "border-box" }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Mail size={16} color="#9ca3af" />
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0 }}>Email Address</label>
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: message.type === "error" && message.text ? "2px solid #f87171" : "2px solid #dbeafe",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    outline: "none",
                    background: "#eff6ff",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <MessageBanner />
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={handleSendEmailOtp}
                  style={{ padding: "12px 24px", background: "#f5c100", color: "#1a0f00", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Send Verification Code
                </button>
              </div>
            </>
          )}

          {/* PHASE 2: EMAIL OTP INPUT */}
          {emailOtpSent && !emailOtpVerified && (
            <div>
              <p style={{ fontSize: 14, color: "#475569", margin: "0 0 24px", fontWeight: 500 }}>
                We've sent a secure code to <strong>{form.email}</strong>
              </p>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength="1"
                    autoFocus={i === 0}
                    value={form.emailOtp[i] || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const newOtp = form.emailOtp.substring(0, i) + value + form.emailOtp.substring(i + 1);
                      setForm({ ...form, emailOtp: newOtp });
                      if (value && e.target.nextSibling) e.target.nextSibling.focus();
                    }}
                    style={{ width: 56, height: 56, textAlign: "center", fontSize: 20, fontWeight: 700, borderRadius: 12, border: "2px solid #dbeafe", outline: "none", background: "#fff", cursor: "text" }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={handleVerifyEmailOtp}
                  style={{ flex: 1, padding: "12px 24px", background: "#f5c100", color: "#1a0f00", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Verify Email
                </button>
                <button
                  onClick={() => { setEmailOtpSent(false); clearMsg(); }}
                  style={{ padding: "12px 24px", background: "transparent", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Edit Details
                </button>
              </div>
              <MessageBanner />
            </div>
          )}

          {/* PHASE 3: EMAIL VERIFIED — success banner + phone */}
          {emailOtpVerified && (
            <div>
              <div style={{
                padding: "14px 18px",
                borderRadius: 12,
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
                color: "#16a34a",
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 28
              }}>
                <Check size={18} color="#16a34a" />
                <span>Email verified successfully — <strong>{form.email}</strong></span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 10 }}>Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={phoneOtpSent}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #fef3c7", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "#fffbeb", boxSizing: "border-box" }}
                />
              </div>

              {!phoneOtpSent ? (
                <>
                  <MessageBanner />
                  <button
                    onClick={handleSendPhoneOtp}
                    style={{ marginTop: 16, padding: "12px 24px", background: "#f5c100", color: "#1a0f00", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    Send Phone OTP
                  </button>
                </>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    {[0, 1, 2, 3].map(i => (
                      <input
                        key={i}
                        type="text"
                        maxLength="1"
                        value={form.phoneOtp[i] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          const newOtp = form.phoneOtp.substring(0, i) + val + form.phoneOtp.substring(i + 1);
                          setForm({ ...form, phoneOtp: newOtp });
                          if (val && e.target.nextSibling) e.target.nextSibling.focus();
                        }}
                        style={{ width: 56, height: 56, textAlign: "center", fontSize: 20, fontWeight: 700, borderRadius: 12, border: "2px solid #fef3c7" }}
                      />
                    ))}
                  </div>
                  <MessageBanner />
                  <button
                    onClick={handleVerifyPhoneOtp}
                    style={{ marginTop: 16, width: "100%", padding: "12px 24px", background: "#111827", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700 }}
                  >
                    Create Member
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e5e7eb", padding: "20px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 900, color: "#111827", margin: "0 0 16px" }}>Onboarding Status</h3>
          {[
            { label: "Details Submitted", done: form.name && form.lastName && form.email },
            { label: "Email Verified", done: emailOtpVerified },
            { label: "Phone Verified", done: phoneOtpVerified },
            { label: "Account Activated", done: phoneOtpVerified }
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: idx < 3 ? 12 : 0 }}>
              <p style={{ fontSize: 13, color: item.done ? "#111827" : "#b0b9c3", fontWeight: item.done ? 700 : 500, margin: 0 }}>{item.label}</p>
              {item.done && <Check size={18} color="#16a34a" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddMemberPage;