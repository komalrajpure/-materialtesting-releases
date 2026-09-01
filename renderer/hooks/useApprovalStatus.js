import { useState, useEffect } from "react";
import { getMemberStatus } from "../services/api";

const getCachedApproval = () => {
  if (typeof window === "undefined") return null;
  const stored = JSON.parse(localStorage.getItem("user_data") || "{}");
  const rawStatus = stored?.approvalStatus ?? stored?.status ?? "";
  return String(rawStatus).toLowerCase().trim() === "approved";
};

const useApprovalStatus = (activePage) => {
  const [isApproved, setIsApproved] = useState(getCachedApproval);

  useEffect(() => {
    checkStatus();
  }, [activePage]); // ✅ runs every time page changes

  const checkStatus = async () => {
    try {
      const data = await getMemberStatus();
      const stored = JSON.parse(localStorage.getItem("user_data") || "{}");
      const profile = Array.isArray(data)
        ? data.find(u => u._id === stored._id || u.id === stored._id) || data[0]
        : data;

      const rawStatus = profile?.approvalStatus ?? profile?.status ?? "";
      const approved = String(rawStatus).toLowerCase().trim() === "approved";

      localStorage.setItem("user_data", JSON.stringify({ ...stored, approvalStatus: rawStatus }));
      setIsApproved(approved);
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem("user_data") || "{}");
      const rawStatus = stored?.approvalStatus ?? stored?.status ?? "";
      setIsApproved(String(rawStatus).toLowerCase().trim() === "approved");
    }
  };

  return { isApproved, checkStatus };
};

export default useApprovalStatus;