import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5c100] via-[#ffd700] to-[#f5a500] px-12">

      <div className="w-full max-w-7xl flex items-center justify-between">

        {/* LEFT SIDE */}
        <div className="flex-1">

          <h1 className="text-6xl font-black text-gray-900 leading-tight mb-4">
            Laboratory Testing Portal
          </h1>

          <p className="text-lg text-gray-800 mb-6">
            Civil construction material testing dashboard.
            <br />
            <span className="font-semibold">
              Secure. Fast. Reliable.
            </span>
          </p>

          {/* IMAGE (gap reduced) */}
          <img
            src="/images/construction.png"
            alt="construction"
            className="w-[360px] animate-float drop-shadow-2xl"
          />

        </div>

        {/* RIGHT SIDE */}
        <div className="w-[480px]">

          <div className="bg-white/90 backdrop-blur-xl rounded-[40px] p-12 shadow-2xl">

            <h2 className="text-3xl font-bold text-center mb-4">
              Welcome Back
            </h2>

            <p className="text-center text-gray-600 mb-8">
              Sign in to access your laboratory dashboard
            </p>

            <label className="text-sm font-semibold">
              PHONE NUMBER
            </label>

            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="w-full mt-2 mb-6 px-4 py-3 rounded-xl border-2 border-gray-300 bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all"
            />

            <button className="w-full py-3 rounded-xl bg-gray-800 text-white font-semibold hover:scale-[1.02] transition">
              Send OTP
            </button>

            <p className="text-center mt-6 text-sm">
              Don’t have an account?{" "}
              <span
                onClick={() => router.push("/register")}
                className="underline cursor-pointer font-semibold"
              >
                Create Account
              </span>
            </p>

          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}