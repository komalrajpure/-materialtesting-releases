import { useEffect, useState } from "react";

import jsPDF from "jspdf";
import { fetchDistrictTaluka } from "../../../services/api";
import { uploadReport } from "../../../services/api";

import {
  SignupSendOtp,
  updateAccountPhoneVerifyOtp
} from "../../../services/api";
import {
  User, Mail, Phone, MapPin, Building2, CreditCard,
  Upload, Save, ChevronDown, AlertCircle, BadgeCheck, Edit2, X, Check, Loader, Download, Eye
} from "lucide-react";

const AccountPage = ({ user }) => {
   const userData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user_data") || "{}")
      : {};
const [labData, setLabData] = useState({
  name: "",
  lastName: "",
    labName: "",
    labEmail: "",
    labDistrict: "",
    labTaluka: "",
    labAddress: "",
    labCity: "",
    labPhone: "",
    registrationDoc: null,
    labApprovalDoc: null,
    gstCertificateDoc: null,
    isoCertificateDoc: null,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    cancelChequePic: null,
    applyGST: "No",
    gstNumber: "",
  });

  const [dragActive, setDragActive] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [submitError, setSubmitError] = useState(""); 

  // ========== PHONE EDIT STATES ==========
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneUpdateLoading, setPhoneUpdateLoading] = useState(false);
  const [phoneUpdateMessage, setPhoneUpdateMessage] = useState("");
  const [phoneUpdateError, setPhoneUpdateError] = useState("");
  const [phoneUpdateSuccess, setPhoneUpdateSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // ===== DISTRICT & TALUKA STATES =====
const [districtData, setDistrictData] = useState([]);
const [districtOptions, setDistrictOptions] = useState([]);
const [talukaOptions, setTalukaOptions] = useState([]);
const [hoverField, setHoverField] = useState(null);

  // ========== API INTEGRATION: LOAD ALL DATA FROM LOCALSTORAGE ==========
  useEffect(() => {
  const userData = localStorage.getItem("user_data");
  
  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      console.log("📦 Loading user data from localStorage:", parsedUser);
let extractedName = 
  parsedUser?.name ||
  parsedUser?.firstName ||
  parsedUser?.first_name ||
  "";

let extractedLastName = 
  parsedUser?.lastName ||
  parsedUser?.last_name ||
  parsedUser?.surname ||
  "";

if (!extractedName && parsedUser?.email) {

  const emailPart = parsedUser.email
    .split("@")[0]
    .replace(/[0-9]/g, "");

  if (emailPart.includes("yadav")) {

    extractedName = emailPart.replace("yadav", "");
    extractedLastName = "yadav";

  } else {

    extractedName = emailPart;
    extractedLastName = "";

  }
}

if (!parsedUser.name && extractedName) {

  const updatedUser = {
    ...parsedUser,
    name: extractedName,
    lastName: extractedLastName
  };

  localStorage.setItem("user_data", JSON.stringify(updatedUser));

  console.log("🔧 Fixed name in localStorage:", updatedUser);
}
      setLabData((prev) => ({
        ...prev,
  name:
  parsedUser?.name && parsedUser.name.trim() !== ""
    ? parsedUser.name
    : extractedName,

lastName:
  parsedUser?.lastName && parsedUser.lastName.trim() !== ""
    ? parsedUser.lastName
    : extractedLastName,
        labName: parsedUser.labName && parsedUser.labName !== "Lab"
          ? parsedUser.labName
          : parsedUser.parentLabName || parsedUser.laboratory_name || parsedUser.lab_name || "",
        labEmail: parsedUser.email || parsedUser.labEmail || parsedUser.email_id || "",
        labPhone: parsedUser.phone || parsedUser.ph || parsedUser.labPhone || parsedUser.phoneNumber || "",
        labAddress: parsedUser.address || parsedUser.addr || parsedUser.labAddress || "",
        labCity: parsedUser.city || parsedUser.city_name || parsedUser.labCity || "",
        labDistrict: parsedUser.district || parsedUser.dist || parsedUser.labDistrict || "",
        labTaluka: parsedUser.taluka || parsedUser.tahsil || parsedUser.labTaluka || "",
        bankName: parsedUser.bankName || parsedUser.bank_name || "",
        ifscCode: parsedUser.ifscCode || parsedUser.ifsc_code || "",
        accountNumber: parsedUser.accountNumber || parsedUser.account_number || "",
        branchName: parsedUser.branchName || parsedUser.branch_name || "",
        gstNumber: parsedUser.gstNumber || parsedUser.gst_number || "",
        applyGST: parsedUser.applyGst || parsedUser.applyGST || parsedUser.apply_gst || "No",
      
registrationDoc: parsedUser?.registractionNabl || null,

labApprovalDoc:
  parsedUser?.approvalCertificate?.startsWith("wix:")
    ? null
    : parsedUser?.approvalCertificate || null,

gstCertificateDoc:
  parsedUser?.gstCertificate?.startsWith("wix:")
    ? null
    : parsedUser?.gstCertificate || null,

isoCertificateDoc:
  parsedUser?.isoCertificate?.startsWith("wix:")
    ? null
    : parsedUser?.isoCertificate || null,

cancelChequePic:
  parsedUser?.chequePhoto?.startsWith("wix:")
    ? null
    : parsedUser?.chequePhoto || null,
      }));

      console.log("✅ User data loaded successfully");
    } catch (e) {
      console.error("❌ Error parsing user data:", e);
    }
  } else {
    console.warn("⚠️ No user_data found in localStorage");
  }
}, []);

useEffect(() => {
  const loadDistrictData = async () => {
    try {
      const data = await fetchDistrictTaluka();

      const actualData = Array.isArray(data)
        ? data
        : data?.items || data?.data || [];

      setDistrictData(actualData);

      const uniqueDistricts = [
        ...new Set(
          actualData
            .map(item => item.district?.trim())
            .filter(Boolean)
        )
      ];

      setDistrictOptions(uniqueDistricts);

    } catch (error) {
      console.error("❌ DISTRICT FETCH ERROR:", error);
    }
  };

  loadDistrictData();
}, []);

useEffect(() => {
  if (!labData.labDistrict || districtData.length === 0) return;

const filteredTalukas = districtData
  .filter(item => item.district1?.trim() === labData.labDistrict)
  .map(item => item.taluka?.trim())
  .filter(Boolean);

  const uniqueTalukas = [...new Set(filteredTalukas)];

  setTalukaOptions(uniqueTalukas);

}, [labData.labDistrict, districtData]);

  const handleChange = (e) => {
  const { name, value, type, files } = e.target;

  if (type === "file") {
    setLabData(prev => ({
  ...prev,
  [name]: files[0] || null
}));
    return;
  }

  if (name === "labDistrict") {

const filteredTalukas = districtData
  .filter(item => item.district1?.trim() === value)
  .map(item => item.taluka?.trim())
  .filter(Boolean);

    const uniqueTalukas = [...new Set(filteredTalukas)];

    setTalukaOptions(uniqueTalukas);

    setLabData({
      ...labData,
      labDistrict: value,
      labTaluka: ""
    });

    return;
  }

 setLabData(prev => ({
  ...prev,
  [name]: value
}));
};

  const handleDrag = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [field]: true });
  };

  const handleDragLeave = (field) => {
    setDragActive({ ...dragActive, [field]: false });
  };

  const handleDrop = (e, field) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive({ ...dragActive, [field]: false });
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
  setLabData(prev => ({
  ...prev,
  [field]: e.dataTransfer.files[0]
}));
  }
};

const removeFile = (field) => {
  setLabData((prev) => ({
    ...prev,
    [field]: null
  }));
};

  // ========== PHONE NUMBER EDITING WITH OTP ==========
  const handleEditPhoneClick = () => {
    setIsEditingPhone(true);
    setNewPhoneNumber(labData.labPhone.toString());
    setPhoneUpdateError("");
    setPhoneUpdateMessage("");
    setOtpSent(false);
  };

  const handleCancelPhoneEdit = () => {
    setIsEditingPhone(false);
    setNewPhoneNumber("");
    setOtpCode("");
    setShowOTPModal(false);
    setPhoneUpdateError("");
    setPhoneUpdateMessage("");
    setOtpSent(false);
  };

  // ========== STEP 1: SEND OTP ==========
  const handleSendOTP = async () => {
    setPhoneUpdateError("");
    setOtpExpired(false);
    if (newPhoneNumber.length !== 10 || isNaN(newPhoneNumber)) {
      setPhoneUpdateError("Please enter a valid 10-digit phone number");
      return;
    }
    setPhoneUpdateLoading(true);

    try {
      const result = await SignupSendOtp(newPhoneNumber);
      console.log("✅ OTP sent successfully:", result);
      setShowOTPModal(true);
      setOtpSent(true);
      setPhoneUpdateMessage("✓ OTP sent successfully to +91 " + newPhoneNumber);

    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      setPhoneUpdateError(error.message || "Failed to send OTP");
    } finally {
      setPhoneUpdateLoading(false);
    }
  };

  const parsedUser = JSON.parse(localStorage.getItem("user_data"));
  console.log("USER DATA:", parsedUser);

  // ========== STEP 2: VERIFY OTP AND UPDATE PHONE ==========
  const handleVerifyOTP = async () => {
    setPhoneUpdateError("");

    if (otpCode.length !== 4 || isNaN(otpCode)) {
      setPhoneUpdateError("Please enter a valid 4-digit OTP");
      return;
    }

    setPhoneUpdateLoading(true);

    try {
   const parsedUser = JSON.parse(localStorage.getItem("user_data"));
   console.log("USER DATA:", parsedUser);

const userId =
  parsedUser?._id ||
  parsedUser?.id ||
  parsedUser?.userId;

if (!userId) {
  setPhoneUpdateError("User ID missing. Please login again.");
  return;
}

      if (!userId) {
        throw new Error("User not found. Please login again.");
      }

      console.log("Verifying OTP with userId:", userId);

      const result = await updateAccountPhoneVerifyOtp({
        userId,
        phoneNumber: newPhoneNumber,
        otp: otpCode,
      });

      console.log("✅ Phone updated successfully:", result);

      setLabData(prev => ({
        ...prev,
        labPhone: newPhoneNumber
      }));

      const updatedUser = {
  ...parsedUser,
  phoneNumber: Number(newPhoneNumber),
  phone: newPhoneNumber
};

      localStorage.setItem("user_data", JSON.stringify(updatedUser));

      setPhoneUpdateSuccess(true);
      setPhoneUpdateMessage("✓ Your phone number has been updated successfully!");

      setTimeout(() => {
        setIsEditingPhone(false);
        setNewPhoneNumber("");
        setOtpCode("");
        setShowOTPModal(false);
        setPhoneUpdateSuccess(false);
        setPhoneUpdateMessage("");
        setOtpSent(false);
      }, 2000);

    } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    if (error.message?.toLowerCase().includes("expired")) {
        setOtpExpired(true);
    }
      setPhoneUpdateError(error.message || "OTP verification failed");
    } finally {
      setPhoneUpdateLoading(false);
    }
  };

  // ========== API INTEGRATION: SAVE DATA WITH FILE UPLOADS ==========
 const handleSubmit = async () => {
  setSubmitError("");

  const authToken = localStorage.getItem("auth_token");
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
  const finalUserId = userData?._id;

    console.log("TOKEN:", authToken);
    console.log("USERID:", finalUserId);
    setLoading(true);

    try {
      const authToken = localStorage.getItem("auth_token");
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");

const finalUserId =
  userData?._id ||
  userData?.id ||
  userData?.userId;

if (!authToken || !finalUserId) {
  setSubmitError("Session expired. Please login again.");
  setLoading(false);
  return;
}

      console.log("📤 Starting profile update...");

let registrationDocUrl = null;
let labApprovalDocUrl = null;
let gstCertificateDocUrl = null;
let isoCertificateDocUrl = null;
let cancelChequePicUrl = null;

if (labData.registrationDoc instanceof File) {
  const res = await uploadReport(labData.registrationDoc);
 registrationDocUrl = res.publicUrl || res.fileUrl;
}

if (labData.labApprovalDoc instanceof File) {
  const res = await uploadReport(labData.labApprovalDoc);
  labApprovalDocUrl = res.publicUrl|| res.fileUrl;
}

if (labData.gstCertificateDoc instanceof File) {
  const res = await uploadReport(labData.gstCertificateDoc);
  gstCertificateDocUrl = res.publicUrl|| res.fileUrl;
}

if (labData.isoCertificateDoc instanceof File) {
  const res = await uploadReport(labData.isoCertificateDoc);
  isoCertificateDocUrl = res.publicUrl|| res.fileUrl;
}

if (labData.cancelChequePic instanceof File) {
  const res = await uploadReport(labData.cancelChequePic);
  cancelChequePicUrl = res.publicUrl|| res.fileUrl;
}

      const payload = {
        _id: finalUserId,
        name: labData.name,
        lastName: labData.lastName,
        labName: labData.labName,
        email: labData.labEmail,
     phoneNumber: Number(labData.labPhone),
        address: labData.labAddress,
        city: labData.labCity,
        district: labData.labDistrict,
        taluka: labData.labTaluka,
        bankName: labData.bankName,
        ifscCode: labData.ifscCode,
        accountNumber: labData.accountNumber,
        branchName: labData.branchName,
        gstNumber: labData.gstNumber,
        applyGst: labData.applyGST,
        
  registractionNabl: registrationDocUrl || userData?.registractionNabl,
approvalCertificate: labApprovalDocUrl || userData?.approvalCertificate,
gstCertificate: gstCertificateDocUrl || userData?.gstCertificate,
isoCertificate: isoCertificateDocUrl || userData?.isoCertificate,
chequePhoto: cancelChequePicUrl || userData?.chequePhoto,
      };
console.log("📤 Sending update to API:", payload);

let response;

try {
  response = await fetch(
    "https://www.bookurtest.com/_functions/updateProfile",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    }
  );
} catch (networkError) {
  console.error("🚨 API ERROR:", networkError);
  setSubmitError("API request blocked. Backend CORS configuration required.");
  setLoading(false);
  return;
}

const result = await response.json();
console.log("✅ API Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Update failed");
      }

      const updatedUserData = {
        ...userData,
        name: labData.name,
        lastName: labData.lastName,
        labName: labData.labName,
        email: labData.labEmail,
        phone: labData.labPhone,
        address: labData.labAddress,
        city: labData.labCity,
        district: labData.labDistrict,
        taluka: labData.labTaluka,
        bankName: labData.bankName,
        ifscCode: labData.ifscCode,
        accountNumber: labData.accountNumber,
        branchName: labData.branchName,
        gstNumber: labData.gstNumber,
        applyGst: labData.applyGST,
        registractionNabl: registrationDocUrl || userData?.registractionNabl,
  approvalCertificate: labApprovalDocUrl || userData?.approvalCertificate,
  gstCertificate: gstCertificateDocUrl || userData?.gstCertificate,
  isoCertificate: isoCertificateDocUrl || userData?.isoCertificate,
  chequePhoto: cancelChequePicUrl || userData?.chequePhoto
      };

      localStorage.setItem("user_data", JSON.stringify(updatedUserData));
      console.log("✅ Account updated successfully");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

    } catch (error) {
      console.error("❌ Error:", error);
      setSubmitError("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== VIEW DOCUMENT =====
const viewDocument = (file) => {
  if (!file) return;

  let url = file;

  if (typeof file !== "string") {
    url = URL.createObjectURL(file);
  }

  if (url.startsWith("wix:")) {
    setSubmitError("Document stored in Wix media. Please download to view.");
    return;
  }

  window.open(url, "_blank");
};

// ===== DOWNLOAD DOCUMENT =====
const downloadDocument = (file) => {
  if (!file) return;

  const url = typeof file === "string" ? file : URL.createObjectURL(file);

  const a = document.createElement("a");
  a.href = url;
  a.download = "document";
  a.click();
};

  const downloadProfilePDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Laboratory Profile Information", 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${labData.name}`, 20, 40);
  doc.text(`Last Name: ${labData.lastName}`, 20, 50);
  doc.text(`Lab Name: ${labData.labName}`, 20, 60);
  doc.text(`Email: ${labData.labEmail}`, 20, 70);
  doc.text(`Phone: ${labData.labPhone}`, 20, 80);
  doc.text(`Address: ${labData.labAddress}`, 20, 90);
  doc.text(`City: ${labData.labCity}`, 20, 100);
  doc.text(`District: ${labData.labDistrict}`, 20, 110);
  doc.text(`Taluka: ${labData.labTaluka}`, 20, 120);
  doc.text("Bank Details", 20, 140);
  doc.text(`Bank Name: ${labData.bankName}`, 20, 150);
  doc.text(`Account Number: ${labData.accountNumber}`, 20, 160);
  doc.text(`IFSC Code: ${labData.ifscCode}`, 20, 170);
  doc.text(`Branch Name: ${labData.branchName}`, 20, 180);
  doc.save("Lab_Profile_Info.pdf");
};

const downloadLabPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Laboratory Information", 20, 20);
  doc.text(`Lab Name: ${labData.labName}`, 20, 40);
  doc.text(`Email: ${labData.labEmail}`, 20, 50);
  doc.text(`Phone: ${labData.labPhone}`, 20, 60);
  doc.text(`Address: ${labData.labAddress}`, 20, 70);
  doc.text(`City: ${labData.labCity}`, 20, 80);
  doc.text(`District: ${labData.labDistrict}`, 20, 90);
  doc.text(`Taluka: ${labData.labTaluka}`, 20, 100);
  doc.save("Lab_Info.pdf");
};

  const downloadBankPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Bank Details", 20, 20);
  doc.setFontSize(12);
  doc.text(`Bank Name: ${labData.bankName}`, 20, 40);
  doc.text(`Account Number: ${labData.accountNumber}`, 20, 50);
  doc.text(`IFSC Code: ${labData.ifscCode}`, 20, 60);
  doc.text(`Branch Name: ${labData.branchName}`, 20, 70);
  doc.save("Bank_Details.pdf");
};

  return (
    <>
      <style>{`
        .premium-input { 
          background: #ffffff; 
          border: 1px solid #e5e7eb; 
          outline: none; 
          border-radius: 10px; 
          padding: 10px 12px; 
          font-size: 13px; 
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03); 
          font-family: inherit; 
          box-sizing: border-box; 
        }
        .premium-input::placeholder {
          color: #374151;
          font-weight: 500;
        }
        .premium-input:focus { 
          background: #ffffff; 
          border-color: #d1d5db; 
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); 
        }
        .section-header { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          margin-bottom: 18px; 
        }
        .section-header::before { 
          content: ''; 
          width: 4px; 
          height: 22px; 
          background: #6b7280; 
          border-radius: 2px; 
        }
        .section-title { 
          font-size: 18px; 
          font-weight: 700; 
          color: #1f2937; 
        }
        .doc-card { 
          background: #ffffff; 
          border: 1px solid #e5e7eb; 
          padding: 14px; 
          border-radius: 12px; 
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03); 
        }
        .doc-card:hover { 
          border-color: #d1d5db; 
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
        }
        .doc-label { 
          font-size: 12px; 
          font-weight: 700; 
        }
        .label-text { 
          font-size: 11px; 
          font-weight: 700; 
          color: #666; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          margin-bottom: 6px; 
        }
        .info-row { 
          display: flex; 
          align-items: flex-start; 
          gap: 10px; 
        }
        .info-label { 
          display: block; 
          font-size: 10px; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.1em; 
          color: #9ca3af; 
        }
        .info-value { 
          display: block; 
          font-size: 13px; 
          font-weight: 700; 
          color: #111; 
          margin-top: 2px; 
        }
        .drag-drop-zone { 
          background: #ffffff; 
          border: 2px dashed #d1d5db; 
          border-radius: 12px; 
          padding: 10px 16px; 
          text-align: center; 
          cursor: pointer; 
          position: relative; 
          overflow: hidden; 
        }
        .drag-drop-zone.active { 
          border-color: #9ca3af; 
          background: #f9fafb; 
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); 
        }
        .drag-drop-zone:hover { 
          border-color: #9ca3af; 
          background: #f9fafb; 
        }
        .drag-drop-content { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 6px; 
        }
        .drag-drop-icon { 
          font-size: 28px; 
        }
        .drag-drop-zone input[type="file"] { 
          display: none; 
        }
        .file-uploaded { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          padding: 6px 10px; 
          background: #f0f0f0; 
          border-radius: 6px; 
          color: #374151; 
          font-weight: 600; 
          font-size: 11px; 
          margin-top: 6px; 
        }
        .phone-display-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
        }
        .phone-number-text {
          flex: 1;
          color: #1f2937;
        }
        .edit-phone-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: color 0.2s;
        }
        .edit-phone-btn:hover {
          color: #374151;
        }
        .phone-edit-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        }
        .phone-button-row {
          display: flex;
          gap: 8px;
        }
        .phone-button-row button {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .send-otp-btn {
          background: #1f2937;
          color: white;
        }
        .send-otp-btn:hover {
          background: #111827;
        }
        .send-otp-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .cancel-btn {
          background: #e5e7eb;
          color: #374151;
        }
        .cancel-btn:hover {
          background: #d1d5db;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        .modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
        }
        .modal-description {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 16px;
        }
        .otp-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 12px;
          box-sizing: border-box;
        }
        .otp-input:focus {
          outline: none;
          border-color: #d1d5db;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .modal-error {
          color: #dc2626;
          font-size: 12px;
          margin-bottom: 12px;
        }
        .modal-success {
          color: #16a34a;
          font-size: 12px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .modal-info {
          color: #0284c7;
          font-size: 12px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .modal-button-row {
          display: flex;
          gap: 8px;
        }
        .verify-btn {
          flex: 1;
          padding: 10px 12px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .verify-btn:hover {
          background: #15803d;
        }
        .verify-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .modal-close-btn {
          flex: 1;
          padding: 10px 12px;
          background: #e5e7eb;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .modal-close-btn:hover {
          background: #d1d5db;
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: "#ffffff", paddingTop: 0, paddingBottom: 24, paddingLeft: 0, paddingRight: 24 }}>
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200" style={{ padding: "20px 24px 20px 32px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f0f0f0", border: "2px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={32} color="#9ca3af" />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#111827", margin: 0 }}>
                Welcome, {labData.name || "User"}
              </h2>
            </div>
          </div>
        </div>

        {/* NOTE BANNER */}
        <div style={{ borderRadius: 12, padding: "14px 18px 14px 32px", background: "#f3f4f6", border: "1.5px solid #d1d5db", display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
          <AlertCircle size={16} color="#6b7280" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#4b5563", margin: 0, lineHeight: 1.6 }}>
            <strong>Note:</strong> If you do not fill in all the required information, the admin will not grant access to the Add Test feature.
          </p>
        </div>

        {/* PERSONAL INFO */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 mt-6 border border-gray-200" style={{ marginLeft: 8 }}>
          <div className="section-header">
            <h2 className="section-title">Personal Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-text block mb-2">name</label>
              <input 
                name="name" 
                value={labData.name} 
                onChange={handleChange} 
                className="w-full premium-input" 
                placeholder="Enter name" 
              />
            </div>
            <div>
              <label className="label-text block mb-2">Last Name</label>
              <input 
                name="lastName" 
                value={labData.lastName} 
                onChange={handleChange} 
                className="w-full premium-input" 
                placeholder="Enter Last Name" 
              />
            </div>
          </div>
        </div>

        {/* LABORATORY INFO */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200" style={{ marginLeft: 8 }}>
          <div className="section-header">
            <h2 className="section-title">Laboratory Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="label-text block mb-2">Laboratory Name</label>
              <input
                name="labName"
                value={labData.labName}
                readOnly
                onMouseEnter={() => setHoverField("labName")}
                onMouseLeave={() => setHoverField(null)}
                className="w-full premium-input"
                style={{ backgroundColor: "#f9fafb", cursor: "not-allowed" }}
              />
              {hoverField === "labName" && (
                <div style={{color:"#dc2626",fontSize:"12px",marginTop:"4px",fontWeight:"600"}}>
                  Lab Name cannot be edited. It is fixed by admin.
                </div>
              )}
            </div>

            <div>
              <label className="label-text block mb-2">Email Address</label>
              <input
                name="labEmail"
                value={labData.labEmail}
                readOnly
                onMouseEnter={() => setHoverField("labEmail")}
                onMouseLeave={() => setHoverField(null)}
                className="w-full premium-input"
                placeholder="Enter Email"
                style={{ backgroundColor: "#f9fafb", cursor: "not-allowed" }}
              />
              {hoverField === "labEmail" && (
                <div style={{color:"#dc2626",fontSize:"12px",marginTop:"4px",fontWeight:"600"}}>
                  Email cannot be changed. It is already registered.
                </div>
              )}
            </div>

            <div>
              <label className="label-text block mb-2">Address</label>
              <input name="labAddress" value={labData.labAddress} onChange={handleChange} className="w-full premium-input" placeholder="Enter Your Address" />
            </div>

            <div>
              <label className="label-text block mb-2">City</label>
              <input name="labCity" value={labData.labCity} onChange={handleChange} className="w-full premium-input" placeholder="Enter City" />
            </div>

            <div>
              <label className="label-text block mb-2">District</label>
              <select name="labDistrict" value={labData.labDistrict} onChange={handleChange} className="w-full premium-input">
                <option value="" disabled hidden>Choose District</option>
                {districtOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text block mb-2">Taluka</label>
              <select name="labTaluka" value={labData.labTaluka} onChange={handleChange} className="w-full premium-input">
                <option value="" disabled hidden>Choose Taluka</option>
                {talukaOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="label-text block mb-2">Phone Number</label>
              
              {!isEditingPhone ? (
                <div className="phone-display-box">
                  <span className="phone-number-text">+91 {labData.labPhone}</span>
                  <button className="edit-phone-btn" onClick={handleEditPhoneClick} title="Edit phone number">
                    <Edit2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="phone-edit-form">
                  <input 
                    type="tel"
                    maxLength="10"
                    value={newPhoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewPhoneNumber(val);
                    }}
                    className="premium-input"
                    placeholder="Enter 10-digit phone number"
                    autoFocus
                  />
                  {phoneUpdateError && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {phoneUpdateError}
                    </div>
                  )}
                  <div className="phone-button-row">
                    <button 
                      className="send-otp-btn"
                      onClick={handleSendOTP}
                      disabled={phoneUpdateLoading || newPhoneNumber.length !== 10}
                    >
                      {phoneUpdateLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          Sending...
                        </span>
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                    <button className="cancel-btn" onClick={handleCancelPhoneEdit} disabled={phoneUpdateLoading}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OTP VERIFICATION MODAL */}
        {showOTPModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Verify OTP</h3>
              <p className="modal-description">
                Enter the 4-digit OTP sent to +91 {newPhoneNumber}
              </p>

              {phoneUpdateError && (
                <div className="modal-error">❌ {phoneUpdateError}</div>
              )}

              {!otpSent && phoneUpdateMessage && (
                <div className="modal-info">✓ {phoneUpdateMessage}</div>
              )}

              {phoneUpdateSuccess && (
                <div className="modal-success">
                  <Check size={16} />
                  {phoneUpdateMessage}
                </div>
              )}

              {!phoneUpdateSuccess && otpSent && (
                <>
                  <input 
                    type="text"
                    maxLength="4"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode(val);
                    }}
                    className="otp-input"
                    placeholder="Enter 4-digit OTP"
                    autoFocus
                  />
                  <div className="modal-button-row">
                    <button 
                      className="verify-btn"
                      onClick={handleVerifyOTP}
                      disabled={phoneUpdateLoading || otpCode.length !== 4}
                    >
                      {phoneUpdateLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        </span>
                      ) : (
                        'Verify OTP'
                      )}
                    </button>
                    <button className="modal-close-btn" onClick={handleCancelPhoneEdit} disabled={phoneUpdateLoading}>
                      Cancel
                    </button>
                  </div>
                  {otpExpired && (
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                      <button
                        onClick={() => {
                          setOtpExpired(false);
                          setOtpCode("");
                          setPhoneUpdateError("");
                          handleSendOTP();
                        }}
                        disabled={phoneUpdateLoading}
                        style={{ background: "none", border: "none", color: "#2563eb", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                      >
                        {phoneUpdateLoading ? "Sending..." : "Resend OTP"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200" style={{ marginLeft: 8 }}>
          <div className="section-header">
            <h2 className="section-title">Documents & Certificates</h2>
          </div>
          {/* ✅ Hint text for documents */}
          <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 16, marginTop: -8 }}>
            Only PDF or Word documents (.pdf, .doc, .docx) are accepted.
          </p>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Registration / NABL Copy", name: "registrationDoc" },
              { label: "Lab Approval Certificate", name: "labApprovalDoc" },
              { label: "GST Certificate", name: "gstCertificateDoc" },
              { label: "ISO Certificate", name: "isoCertificateDoc" },
            ].map((doc, idx) => (
              <div key={idx} className="doc-card">
                <h3 className="doc-label text-gray-900 mb-2">{doc.label}</h3>
                {!labData[doc.name] && (
                  <div 
                    className={`drag-drop-zone ${dragActive[doc.name] ? 'active' : ''}`}
                    onDragOver={(e) => handleDrag(e, doc.name)}
                    onDragLeave={() => handleDragLeave(doc.name)}
                    onDrop={(e) => handleDrop(e, doc.name)}
                    onClick={() => document.getElementById(doc.name).click()}
                  >
                    {/* ✅ CHANGED: only pdf and word documents, no images */}
                    <input id={doc.name} name={doc.name} type="file" onChange={handleChange} accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                    <div className="drag-drop-content">
                      <div className="drag-drop-icon">📤</div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">Drag & Drop</p>
                        <p className="text-xs text-gray-600">PDF or Word only</p>
                      </div>
                    </div>
                  </div>
                )}
                {labData[doc.name] && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "8px", background: "#f9fafb", border: "1px solid #e5e7eb", fontSize: "13px", fontWeight: "600" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      📄 {typeof labData[doc.name] === "string" ? labData[doc.name].split("/").pop() : labData[doc.name]?.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Eye size={18} style={{ cursor: "pointer", color: "#2563eb" }} onClick={(e) => { e.stopPropagation(); viewDocument(labData[doc.name]); }} />
                      <Download size={18} style={{ cursor: "pointer", color: "#059669" }} onClick={(e) => { e.stopPropagation(); downloadDocument(labData[doc.name]); }} />
                      <X size={18} style={{ cursor: "pointer", color: "#ef4444" }} onClick={(e) => { e.stopPropagation(); removeFile(doc.name); }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BANK DETAILS */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200" style={{ marginLeft: 8 }}>
          <div className="section-header">
            <h2 className="section-title">Bank Details</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: "Bank Name", name: "bankName", placeholder: "Enter Bank Name" },
              { label: "IFSC Code", name: "ifscCode", placeholder: "Enter IFSC code" },
              { label: "Account Number", name: "accountNumber", placeholder: "Enter Bank Account Number" },
              { label: "Branch Name", name: "branchName", placeholder: "Enter Branch Name" },
            ].map((field, idx) => (
              <div key={idx}>
                <label className="label-text block mb-2">{field.label}</label>
                <input name={field.name} value={labData[field.name]} onChange={handleChange} className="w-full premium-input" placeholder={field.placeholder} />
              </div>
            ))}
          </div>
          <div className="doc-card">
            <h3 className="doc-label text-gray-900 mb-2">Cancel Cheque Photo</h3>
            {/* ✅ Hint text for cheque photo */}
            <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 8, marginTop: -4 }}>
              Only images (.jpg, .jpeg, .png) are accepted.
            </p>
            {!labData.cancelChequePic && (
              <div 
                className={`drag-drop-zone ${dragActive.cancelChequePic ? 'active' : ''}`}
                onDragOver={(e) => handleDrag(e, 'cancelChequePic')}
                onDragLeave={() => handleDragLeave('cancelChequePic')}
                onDrop={(e) => handleDrop(e, 'cancelChequePic')}
                onClick={() => document.getElementById('cancelChequePic').click()}
              >
                {/* ✅ CHANGED: only images, no pdf/doc */}
                <input id="cancelChequePic" name="cancelChequePic" type="file" onChange={handleChange} accept=".jpg,.jpeg,.png,image/jpeg,image/png" />
                <div className="drag-drop-content">
                  <div className="drag-drop-icon">📸</div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs">Drag & Drop</p>
                    <p className="text-xs text-gray-600">Images only (JPG, PNG)</p>
                  </div>
                </div>
              </div>
            )}
            {labData.cancelChequePic && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "8px", background: "#f9fafb", border: "1px solid #e5e7eb", fontSize: "13px", fontWeight: "600" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  📄 {typeof labData.cancelChequePic === "string" ? "Uploaded Document" : labData.cancelChequePic.name}
                </span>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Eye size={18} style={{ cursor: "pointer", color: "#2563eb" }} onClick={(e) => { e.stopPropagation(); viewDocument(labData.cancelChequePic); }} />
                  <Download size={18} style={{ cursor: "pointer", color: "#059669" }} onClick={(e) => { e.stopPropagation(); downloadDocument(labData.cancelChequePic); }} />
                  <X size={18} style={{ cursor: "pointer", color: "#ef4444" }} onClick={(e) => { e.stopPropagation(); removeFile("cancelChequePic"); }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GST SECTION */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200" style={{ marginLeft: 8 }}>
          <div className="section-header">
            <h2 className="section-title">GST Configuration</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-text block mb-2">Apply GST to Test Amount</label>
              <select name="applyGST" value={labData.applyGST} onChange={handleChange} className="w-full premium-input">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="label-text block mb-2">GST Number (Optional)</label>
              <input name="gstNumber" value={labData.gstNumber} onChange={handleChange} className="w-full premium-input" placeholder="Enter GST Number" />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-center gap-4 mb-8" style={{ flexDirection: "column", alignItems: "center" }}>

          {submitError && (
            <div style={{
              background: "#fef2f2",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "8px",
              fontWeight: "700",
              fontSize: "13px",
              border: "1.5px solid #fecaca",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center"
            }}>
              ⚠ {submitError}
            </div>
          )}

          {saved && (
            <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "700", textAlign: "center" }}>
              Profile updated successfully ✅
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "12px 32px",
              borderRadius: 12,
              border: "none",
              fontWeight: 800,
              background: saved ? "#16a34a" : "#f5c100",
              color: saved ? "#fff" : "#000",
              cursor: loading ? "not-allowed" : "pointer",
              minWidth: "180px"
            }}
          >
            {loading ? "Updating Info..." : saved ? "Saved ✓" : "Update Info"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AccountPage;