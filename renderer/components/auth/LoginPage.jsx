import { useState, useEffect } from "react";
import AuthLayout from "./AuthLayout";
import { loginSendOtp, loginVerifyOtp } from "../../services/api";

export const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  disabled,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".12em",
          color: "#9ca3af",
          display: "block",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full px-3 py-2 rounded-lg border-2 bg-white outline-none text-gray-900 text-sm font-medium placeholder-gray-300 transition-all disabled:opacity-60 ${
          focused
            ? "border-yellow-400 ring-2 ring-yellow-400/20"
            : "border-gray-200"
        }`}
      />
    </div>
  );
};

const LoginPage = ({ onLogin, onGoToSignup }) => {
  const [step, setStep]         = useState(1);
  const [phone, setPhone]       = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [timer, setTimer]       = useState(0); // ✅ Merged from doc 4

  // ✅ Merged from doc 4 — countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  /* ── STEP 1: Send OTP ── */
  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError(""); setSuccess(""); setLoading(true);
    try {
      await loginSendOtp(phone);
      setSuccess(`✓ OTP sent to +91 ${phone}`);
      setStep(2);
      setTimer(40); // ✅ Merged from doc 4 — 40s resend cooldown
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 2: Verify OTP & Login ── */
  const handleVerifyOtp = async () => {
    // ✅ Merged from doc 4 — strict 4-digit validation
    if (otpInput.length !== 4) {
      setError("Please enter a valid 4-digit OTP.");
      return;
    }
    setError(""); setSuccess(""); setLoading(true);

    try {
      // 1. Verify OTP — backend returns token + correct user profile directly
      const res = await loginVerifyOtp(phone, otpInput);

      const token = res.token || res.authToken;
      if (!token) throw new Error("Token not received from server");

      // 2. Save auth token
      localStorage.setItem("auth_token", token);
      localStorage.setItem("userId", phone);

      // 3. Use profile directly from loginVerifyOtp response (no extra API call)
      const profile = res.user || res.data || res;

      const normalize = (num) =>
        String(num || "").replace(/\D/g, "").slice(-10);

      // Find correct profile if response is an array
      let resolvedProfile = profile;
      if (Array.isArray(profile)) {
        resolvedProfile = profile.find((u) => {
          const p =
            normalize(u.phone) ||
            normalize(u.phoneNumber) ||
            normalize(u.mobile) ||
            normalize(u.ph);
          return p === normalize(phone);
        });

        // ⚠️ Never silently fall to profile[0] — throws clear error instead
        if (!resolvedProfile) {
          throw new Error("No matching profile found for this phone number.");
        }
      }

      if (!resolvedProfile) throw new Error("User profile not found in response");

      // type normalization
      const finalType = String(
        resolvedProfile.type ||
        resolvedProfile.role ||
        resolvedProfile.userType ||
        "inspector"
      ).trim().toLowerCase();

      // ✅ Merged from doc 4 — proper approvalStatus normalization
      const rawStatus =
        resolvedProfile.approvalStatus ??
        resolvedProfile.status ??
        resolvedProfile.isApproved ??
        resolvedProfile.approved ??
        false;

      const normalizedStatus = String(rawStatus).toLowerCase().trim();

      let approvalStatus = "pending";
      if (
        normalizedStatus === "approved" ||
        normalizedStatus === "true"  ||
        rawStatus === true
      ) {
        approvalStatus = "approved";
      }
      if (
        normalizedStatus === "non-approved" ||
        normalizedStatus === "rejected"
      ) {
        approvalStatus = "rejected";
      }

      const userObj = {
        _id:      resolvedProfile._id  || resolvedProfile.id || phone,
        id:       resolvedProfile._id  || resolvedProfile.id || phone,
        phone:    resolvedProfile.phone || resolvedProfile.phoneNumber || resolvedProfile.ph || phone,
        username: resolvedProfile.username || "",
        name:
          resolvedProfile.name ||
          resolvedProfile.firstName ||
          resolvedProfile.first_name ||
          "",
        lastName:
          resolvedProfile.lastName ||
          resolvedProfile.last_name ||
          resolvedProfile.surname ||
          "",
        email:         resolvedProfile.email         || "",
        labName:       resolvedProfile.labName       || "",
        type:          finalType,
        approvalStatus: approvalStatus, // ✅ properly normalized

        // Address
        address:  resolvedProfile.address  || "",
        city:     resolvedProfile.city     || "",
        district: resolvedProfile.district || "",
        taluka:   resolvedProfile.taluka   || "",

        // Bank
        bankName:      resolvedProfile.bankName      || "",
        ifscCode:      resolvedProfile.ifscCode      || "",
        accountNumber: resolvedProfile.accountNumber || "",
        branchName:    resolvedProfile.branchName    || "",

        // GST
        gstNumber: resolvedProfile.gstNumber || "",
        applyGst:  resolvedProfile.applyGst  || "No",
      };

      // 4. Save to localStorage
      localStorage.setItem("user_data", JSON.stringify(userObj));
      console.log("✅ Login successful:", userObj);

      // 5. Notify parent (index.jsx) — triggers routing by type
      if (onLogin) onLogin(userObj);

    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setStep(1); setOtpInput(""); setError(""); setSuccess("");
  };

  const primaryBtn = `w-full py-2.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2
    bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
    hover:from-yellow-500 hover:to-yellow-700 text-gray-900
    hover:shadow-lg hover:shadow-yellow-500/40 hover:scale-[1.02] active:scale-95
    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100`;

  const Spinner = () => (
    <span className="w-4 h-4 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
  );

  const ErrorBanner = ({ msg }) =>
    msg ? (
      <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
        {msg}
      </div>
    ) : null;

  const SuccessBanner = ({ msg }) =>
    msg ? (
      <div className="mb-3 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-600 text-xs font-semibold">
        {msg}
      </div>
    ) : null;

  return (
    <AuthLayout backgroundImage="/images/login-bg.jpg">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-20 items-center">

        {/* ── LEFT PANEL ── */}
        <div className="space-y-7">
          <div>
            <p className="text-black font-bold uppercase tracking-widest text-xs mb-3 drop-shadow-lg">
              🏗️ Construction Testing Portal
            </p>
            <h1
              className="text-5xl font-black leading-tight mb-3 text-black"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
            >
              Material Testing
              <br />
              Excellence
            </h1>
            <p
              className="text-xl font-bold text-black"
              style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.3)" }}
            >
              Civil Construction Laboratory Dashboard
            </p>
          </div>

          <p
            className="text-sm text-black leading-relaxed max-w-xl font-semibold"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Professional material testing solutions for civil construction
            projects. Manage tests, reports, and operations with precision and
            security.
            <br /><br />
            <span className="font-black">✓ Certified • ✓ Accurate • ✓ Professional</span>
          </p>

          <img
            src="/images/construction.png"
            alt="Construction site"
            className="w-48 rounded-2xl shadow-2xl border-4 border-black/20 hover:scale-105 transition-transform duration-300 object-cover"
          />
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl px-7 py-6 shadow-2xl border border-white/40">

            <div className="mb-4">
              <h2 className="text-xl font-black text-gray-900">
                {step === 1 ? "🔓 Welcome Back" : "✓ Verify OTP"}
              </h2>
              <p className="text-gray-400 text-xs mt-0.5 font-medium">
                {step === 1
                  ? "Enter your mobile number to receive an OTP"
                  : `OTP sent to +91 ${phone}`}
              </p>
            </div>

            <ErrorBanner msg={error} />
            <SuccessBanner msg={!error ? success : ""} />

            <div className="space-y-2.5">

              {step === 1 && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      disabled={loading}
                      className="w-full px-3 py-2 rounded-lg border-2 bg-white outline-none text-gray-900 text-sm font-medium placeholder-gray-300 transition-all disabled:opacity-60 border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={loading || phone.length !== 10}
                    className={primaryBtn}
                  >
                    {loading && <Spinner />}
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      Enter OTP *
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter 4-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                      disabled={loading}
                      className="w-full px-3 py-2 rounded-lg border-2 bg-white outline-none text-gray-900 text-sm font-medium tracking-widest placeholder-gray-300 transition-all disabled:opacity-60 border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                    />
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otpInput.length !== 4}
                    className={primaryBtn}
                  >
                    {loading && <Spinner />}
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>

                  {/* ✅ Merged from doc 4 — timer-gated resend */}
                  <p className="text-center text-xs text-gray-400">
                    {timer > 0 ? (
                      <span>Resend OTP in {timer}s</span>
                    ) : (
                      <>
                        Didn't receive?{" "}
                        <button
                          onClick={handleSendOtp}
                          className="font-black text-yellow-700 underline bg-transparent border-none cursor-pointer hover:text-yellow-800"
                        >
                          Resend OTP
                        </button>
                      </>
                    )}
                  </p>
                </>
              )}

            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-400 font-semibold">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* ✅ Merged from doc 4 — more visible register text */}
            <p className="text-center text-sm text-gray-700 font-semibold">
              Don't have an account?{" "}
              <button
                onClick={onGoToSignup}
                className="font-black text-yellow-700 underline bg-transparent border-none cursor-pointer hover:text-yellow-800"
              >
                Register Here
              </button>
            </p>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center font-semibold">
                🔒 Enterprise-Grade Security • SSL Encrypted
              </p>
            </div>

          </div>
        </div>

      </div>
    </AuthLayout>
  );
};

export default LoginPage;