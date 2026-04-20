// components/auth/SignupPage.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import {
  SignupSendOtp,              // POST /Login          → sends phone OTP
  registrationPhoneVerify,   // POST /RegistrationPhoneverify → verifies OTP + creates account
  emailVerification,         // POST /EmailVerification → checks uniqueness + sends email OTP
  emailVerifyOtp,
  labNameVerification            // POST /EmailVerifyOtp → verifies email OTP
} from "../../services/api";
import AuthLayout from "./AuthLayout";
const lbl = "text-sm font-bold text-gray-600 uppercase tracking-wide block mb-1";
const inp  = "w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none text-gray-900 text-sm font-medium placeholder-gray-300 transition-all disabled:opacity-60";
const Banner = ({ type, msg }) => msg ? (
  <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-semibold border ${
    type === "error"
      ? "bg-red-50 border-red-200 text-red-600"
      : "bg-green-50 border-green-200 text-green-600"
  }`}>{msg}</div>
) : null;

const Spinner = ({ white = false }) => (
  <span className={`w-4 h-4 border-2 rounded-full animate-spin ${
    white ? "border-white/20 border-t-white" : "border-gray-900/20 border-t-gray-900"
  }`} />
);

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const SignupPage = ({ onSignup, onGoToLogin }) => {
  const router = useRouter();

  // ── state ──────────────────────────────────
  const [step, setStep] = useState(1); // 1 = Personal Info | 2 = Organization Info

  // Step 1 — personal details + email OTP
  const [s1, setS1] = useState({ name: "", lastName: "", email: "", emailOtp: "" });
  const [emailOtpSent,     setEmailOtpSent]     = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);

  // Step 2 — org details + phone OTP
  // type: "Lab" | "Contractor"
  const [s2, setS2] = useState({ type: "Lab", labName: "", phone: "", phoneOtp: "" });
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const upS1 = k => e => setS1(f => ({ ...f, [k]: e.target.value }));
  const upS2 = k => e => setS2(f => ({ ...f, [k]: e.target.value }));
  const goToLogin = () => { if (onGoToLogin) onGoToLogin(); else router.push("/"); };
  const clr = () => { setError(""); setSuccess(""); };

  /* ────────────────────────────────────────────
     STEP 1  helpers
  ──────────────────────────────────────────── */

  // POST /EmailVerification  — checks uniqueness & dispatches email OTP
  const handleSendEmailOtp = async () => {
    if (!s1.name.trim() || !s1.lastName.trim()) {
      setError("Enter your first and last name."); return;
    }
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(s1.email)) {
  setError("Enter a valid email address."); 
}
    clr(); setLoading(true);
    try {
      await emailVerification(s1.email);
      setEmailOtpSent(true);
      setSuccess(`OTP sent to ${s1.email}`);
    } catch (err) {
      setError(err.message || "Failed to send email OTP.");
    } finally { setLoading(false); }
  };

  // POST /EmailVerifyOtp  — confirms the 6-digit code
  const handleVerifyEmailOtp = async () => {
    if (!s1.emailOtp) { setError("Please enter the OTP sent to your email."); return; }
    clr(); setLoading(true);
    try {
      await emailVerifyOtp(s1.email, s1.emailOtp);
      setEmailOtpVerified(true);
      setSuccess("Email verified! Continue to next step.");
    } catch (err) {
      setError(err.message || "Invalid email OTP.");
    } finally { setLoading(false); }
  };

  // Reset so user can request a fresh email OTP
  const handleResendEmailOtp = () => {
    setEmailOtpSent(false);
    setS1(f => ({ ...f, emailOtp: "" }));
    clr();
  };

  const handleNextStep = () => {
    if (!emailOtpVerified) { setError("Please verify your email first."); return; }
    clr(); setStep(2);
  };

  /* ────────────────────────────────────────────
     STEP 2  helpers
  ──────────────────────────────────────────── */

  // POST /Login  — sends phone OTP (same endpoint used for login)
 const handleSendPhoneOtp = async () => {
  if (s2.phone.length !== 10) { setError("Enter a valid 10-digit mobile number."); return; }
  if (!s2.type)               { setError("Select an organization type."); return; }
  if (!s2.labName.trim())     { setError(`Enter your ${s2.type === "Lab" ? "laboratory" : "company"} name.`); return; }

  clr(); setLoading(true);
  try {
    // ── Lab name uniqueness check ──────────────────
    const labCheck = await labNameVerification(s2.labName.trim());

    // Adjust the condition below based on actual API response shape:
    // e.g. { exists: true }  OR  { success: false, message: "..." }
    if (labCheck.exists === true || labCheck.success === false) {
      setError(
        labCheck.message ||
        `"${s2.labName}" is already registered. Please use a different name.`
      );
      setLoading(false);
      return;
    }
    // ── Lab name is available → send phone OTP ─────
    await SignupSendOtp(s2.phone);
    setPhoneOtpSent(true);
    setSuccess(`OTP sent to +91 ${s2.phone}`);
  } catch (err) {
    setError(err.message || "Failed to send phone OTP.");
  } finally { setLoading(false); }
};

  // POST /RegistrationPhoneverify  — verifies phone OTP + inserts user + returns token
  const handleCreate = async () => {
  if (!s2.phoneOtp) {
    setError("Please enter the OTP sent to your phone.");
    return;
  }

  clr();
  setLoading(true);
try {
  const response = await registrationPhoneVerify({
    phone: s2.phone,
    otp: s2.phoneOtp,
    name: s1.name,
    lastName: s1.lastName,
    email: s1.email,
    labName: s2.labName,
    type: "Lab"  // ✅ Explicitly passing type
  });

  console.log("✅ Signup success:", response);

  const token = response.token || response.authToken;

  if (token) {
    localStorage.setItem("auth_token", token);

    // Build userData from BOTH response AND form input
    const apiUser = response.user || response.data || {};
    
    const userData = {
      _id: apiUser._id || apiUser.id || "",
      name: s1.name,              // ✅ From form (step 1)
      lastName: s1.lastName,      // ✅ From form (step 1)
      email: s1.email,            // ✅ From form (step 1)
      phone: s2.phone,            // ✅ From form (step 2)
      labName: s2.labName,        // ✅ From form (step 2) — THIS WAS MISSING!
      type: "Lab",                // ✅ Explicit type
      approvalStatus: apiUser.approvalStatus || "pending"
    };

    localStorage.setItem("user_data", JSON.stringify(userData));
    console.log("✅ Signup saved user:", userData);

    if (onSignup) {
      onSignup({
        ...userData,
        fromSignup: true
      });
    }
  }

} catch (err) {
  setError(err.message || "Registration failed.");
} finally {
  setLoading(false);
}
};

  /* ── Progress bar width ── */
  const progressWidth = step === 1
    ? (emailOtpVerified ? "50%" : emailOtpSent ? "25%" : "10%")
    : (phoneOtpSent     ? "90%" : "65%");

  /* ── Button class strings ── */
  const primaryBtn = [
    "w-full py-2.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all",
    "flex items-center justify-center gap-2",
    "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600",
    "hover:from-yellow-500 hover:to-yellow-700 text-gray-900",
    "hover:shadow-lg hover:shadow-yellow-500/40 hover:scale-[1.02] active:scale-95",
    "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
  ].join(" ");

  const darkBtn = [
    "w-full py-2.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all",
    "flex items-center justify-center gap-2",
    "bg-gray-900 hover:bg-gray-800 text-white",
    "hover:shadow-lg hover:scale-[1.02] active:scale-95 border border-yellow-400/30",
    "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
  ].join(" ");

  const ghostBtn = "w-full py-2 rounded-lg border border-gray-200 text-gray-400 font-bold text-xs hover:border-gray-300 hover:text-gray-600 transition-all bg-transparent";

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <AuthLayout backgroundImage="/images/register-bg.jpg">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-20 items-center">

        {/* ── LEFT panel ── */}
        <div className="space-y-7">
          <div>
            <p className="text-black font-bold uppercase tracking-widest text-xs mb-3 drop-shadow-lg">
              🏭 Join Our Network
            </p>
            <h1
              className="text-5xl font-black leading-tight mb-3 text-black"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
            >
              Create Your<br />Lab Account
            </h1>
            <p className="text-xl font-bold text-black" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.3)" }}>
              Professional Testing Solutions
            </p>
          </div>

          <p className="text-sm text-black leading-relaxed max-w-xl font-semibold"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
            Join our network of certified laboratories. Manage your testing operations
            with complete transparency and industry-leading standards.
            <br /><br />
            <span className="font-black">✓ ISO Certified • ✓ Full Compliance • ✓ 24/7 Support</span>
          </p>

          <div className="flex flex-col gap-2">
            {["Submit test requests instantly", "Track lab reports in real time", "Download certified reports"].map(t => (
              <div key={t} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black/40 shrink-0" />
                <span className="text-sm font-semibold text-black/70">{t}</span>
              </div>
            ))}
          </div>

          <img
            src="/images/construction.png"
            alt="Lab testing"
            className="w-48 rounded-2xl shadow-2xl border-4 border-black/20 hover:scale-105 transition-transform duration-300 object-cover"
          />
        </div>

        {/* ── RIGHT panel ── */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl px-10 py-8 shadow-2xl border border-white/40">

            {/* Step indicator pills */}
            <div className="flex items-center gap-2 mb-4">
              {[1, 2].map(n => (
                <div key={n} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    step === n ? "bg-yellow-400 text-gray-900"
                    : step > n  ? "bg-gray-900 text-white"
                    :             "bg-gray-100 text-gray-400"
                  }`}>
                    {step > n ? "✓" : n}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${step === n ? "text-gray-700" : "text-gray-300"}`}>
                    {n === 1 ? "Personal" : "Organization"}
                  </span>
                  {n < 2 && <div className="w-6 h-px bg-gray-200 mx-1" />}
                </div>
              ))}
            </div>

            {/* Card header */}
            <div className="mb-4">
              <h2 className="text-xl font-black text-gray-900">
                {step === 1 ? "Personal Info" : "Organization Info"}
              </h2>
              <p className="text-gray-400 text-xs mt-0.5 font-medium">
                {step === 1 ? "Start with your name & email" : "Tell us about your organization"}
              </p>
            </div>

            <Banner type="error"   msg={error} />
            <Banner type="success" msg={!error ? success : ""} />

            <div className="space-y-2.5">

              {/* ══════════════════════════════
                  STEP 1 — Personal Info
              ══════════════════════════════ */}
              {step === 1 && (
                <>
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={lbl}>name *</label>
                 <input
  type="text"
  value={s1.name}
  onChange={upS1("name")}
  disabled={emailOtpSent}
  className={inp}
/>
                    </div>
                    <div>
                      <label className={lbl}>Last Name *</label>
                      <input
  type="text"
  value={s1.lastName}
  onChange={upS1("lastName")}
  disabled={emailOtpSent}
  className={inp}
/>
                    </div>
                  </div>

                  {/* Email + Send OTP */}
                  <div>
                    <label className={lbl}>Email Address *</label>
                    <div className="flex gap-2">
                      <input
  type="email"
  value={s1.email}
  onChange={upS1("email")}
  disabled={emailOtpSent}
  className={`${inp} flex-1`}
/>

                      {/* Not sent yet → Send OTP button */}
                      {!emailOtpSent && !emailOtpVerified && (
                        <button
                          onClick={handleSendEmailOtp} disabled={loading}
                          className="shrink-0 px-3 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
                        >
                          {loading ? <Spinner /> : null}
                          Send OTP
                        </button>
                      )}

                      {/* Sent, awaiting verification */}
                      {emailOtpSent && !emailOtpVerified && (
                        <span className="shrink-0 px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 font-black text-[10px] uppercase tracking-wider flex items-center">
                          Sent ✓
                        </span>
                      )}

                      {/* Verified */}
                      {emailOtpVerified && (
                        <span className="shrink-0 px-3 py-2 rounded-lg bg-green-100 text-green-700 font-black text-[10px] uppercase tracking-wider flex items-center">
                          Verified ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email OTP input — shown only after send, before verify */}
                  {emailOtpSent && !emailOtpVerified && (
                    <div>
                      <label className={lbl}>Email OTP *</label>
                      <div className="flex gap-2">
                       <input
  type="tel"
  value={s1.emailOtp}
  onChange={upS1("emailOtp")}
  className={`${inp} flex-1 tracking-widest`}
/>
                        <button
                          onClick={handleVerifyEmailOtp} disabled={loading}
                          className="shrink-0 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                        >
                          {loading ? <Spinner white /> : null}
                          Verify
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Didn't receive?{" "}
                        <button
                          onClick={handleResendEmailOtp}
                          className="font-black text-yellow-700 underline bg-transparent border-none cursor-pointer"
                        >
                          Resend
                        </button>
                      </p>
                    </div>
                  )}

                  <button onClick={handleNextStep} disabled={!emailOtpVerified} className={`${primaryBtn} mt-1`}>
                    Next →
                  </button>
                </>
              )}

              {/* ══════════════════════════════
                  STEP 2 — Organization Info
              ══════════════════════════════ */}
              {step === 2 && (
                <>
                  {/* Type dropdown — Lab or Contractor */}
                <div>
  <label className={lbl}>Organization Type *</label>
  <input
    type="text"
    value="Lab"
    disabled
    className={inp}
  />
</div>

                  {/* Lab / Company name — always shown, label adapts */}
                  <div>
                    <label className={lbl}>
                      {s2.type === "Lab" ? "Laboratory Name *" : "Company Name *"}
                    </label>
                <input
  type="text"
  value={s2.labName}
  onChange={upS2("labName")}
  disabled={phoneOtpSent}
  className={inp}
/>
                  </div>

                  {/* Phone number + Send OTP */}
                  <div>
                    <label className={lbl}>Phone / WhatsApp *</label>
                    <div className="flex gap-2">
                      <input
  type="tel"
  value={s2.phone}
  disabled={phoneOtpSent}
  onChange={e =>
    setS2(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))
  }
  className={`${inp} flex-1`}
/>
                      {!phoneOtpSent && (
                        <button
                          onClick={handleSendPhoneOtp} disabled={loading}
                          className="shrink-0 px-3 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                        >
                          {loading ? <Spinner /> : null}
                          Send OTP
                        </button>
                      )}
                      {phoneOtpSent && (
                        <span className="shrink-0 px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 font-black text-[10px] uppercase tracking-wider flex items-center">
                          Sent ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone OTP input + Create Account button */}
                  {phoneOtpSent && (
                    <>
                      <div>
                        <label className={lbl}>Phone OTP *</label>
                        <div className="flex gap-2">
                          <input
                            type="tel" placeholder="Enter phone OTP" value={s2.phoneOtp}
                            onChange={e => setS2(f => ({ ...f, phoneOtp: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                            className={`${inp} flex-1 tracking-widest`}
                          />
                          <button
                            onClick={() => { setPhoneOtpSent(false); setSuccess(""); setS2(f => ({ ...f, phoneOtp: "" })); }}
                            className="shrink-0 px-3 py-2 rounded-lg border border-gray-200 text-gray-400 font-black text-[10px] uppercase tracking-wider transition-all hover:border-gray-300 hover:text-gray-600 whitespace-nowrap"
                          >
                            Resend
                          </button>
                        </div>
                      </div>

                      <button onClick={handleCreate} disabled={loading} className={darkBtn}>
                        {loading ? <Spinner white /> : null}
                        {loading ? "Creating Account…" : "Create Account ✓"}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => { setStep(1); clr(); setPhoneOtpSent(false); }}
                    className={ghostBtn}
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mb-1">
                {step === 1
                  ? (emailOtpVerified ? "Email Verified ✓" : emailOtpSent ? "Check your email" : "Step 1 of 2")
                  : "Step 2 of 2"}
              </p>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500 rounded-full"
                  style={{ width: progressWidth }}
                />
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-3">
              Already have an account?{" "}
              <button
                onClick={goToLogin}
                className="font-black text-yellow-700 underline bg-transparent border-none cursor-pointer hover:text-yellow-800"
              >
                Sign In
              </button>
            </p>

          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
