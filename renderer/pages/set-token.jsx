import { useState } from "react";
import { useRouter } from "next/router";

export default function SetToken() {
  const [token, setToken] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim() || phone.length !== 10) {
      setError("Please enter valid details");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Save Token
      localStorage.setItem('auth_token', token);
      localStorage.setItem('userId', phone);
      
      const response = await fetch(`https://www.bookurtest.com/_functions/members?id=${phone}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data?.data || data?.id) {
        const profile = data.data || data;
        
        // Map keys to match AccountPage state exactly
        const userObj = {
          name: profile.name || "",
          lastName: profile.lastName || "",
          labName: profile.labName || "",
          email: profile.email || "",
          phone: phone,
          address: profile.address || "",
          city: profile.city || "",
          district: profile.district || "",
          taluka: profile.taluka || "",
          bankName: profile.bankName || "",
          ifscCode: profile.ifscCode || "",
          accountNumber: profile.accountNumber || "",
          branchName: profile.branchName || "",
          gstNumber: profile.gstNumber || "",
          applyGst: profile.applyGst || "No"
        };

        localStorage.setItem('user_data', JSON.stringify(userObj));

       
        setSuccess("✅ API Connected & Data Synced!");
        setTimeout(() => router.push("/"), 1500);

      } else {
        setError("User not found in database.");
      }
    } catch (err) {
      setError("Failed to verify token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Set API Token</h1>

        {/* ✅ Inline error */}
        {error && <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 16 }}>{error}</p>}

        {/* ✅ Inline success */}
        {success && <p style={{ color: "#16a34a", fontWeight: 700, marginBottom: 16 }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            placeholder="Phone Number (10 Digit)"
            className="w-full p-2 border rounded mb-4"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="text"
            placeholder="Paste API Token"
            className="w-full p-2 border rounded mb-4"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? "Connecting..." : "Save & Sync Data"}
          </button>
        </form>
      </div>
    </div>
  );
}