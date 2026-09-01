// src/services/api.js

const API_BASE_URL = "https://www.bookurtest.com/_functions";

const TOKEN_KEY = "auth_token";
const USER_KEY  = "user_data";

const getPublicHeaders = () => ({
  "Content-Type": "application/json",
});

const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    throw new Error("Cannot access auth token on the server.");
  }
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error("You are not logged in. Please log in to continue.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const requireAuthToken = () => {
  if (typeof window === "undefined") {
    throw new Error("Cannot access auth token on the server.");
  }
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error("You are not logged in. Please log in to continue.");
  }
  return token;
};

export const setAuthToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const setUserData = (userData) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }
};

export const getUserData = () => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(TOKEN_KEY);
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// ─────────────────────────────────────────────
// 🔓 PUBLIC endpoints (no token required)
// ─────────────────────────────────────────────

export const fetchDistrictTaluka = async () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("No auth token found");

  const response = await fetch(`${API_BASE_URL}/district`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }

  return Array.isArray(data)
    ? data
    : Object.values(data).find((v) => Array.isArray(v)) || [];
};

export const emailVerification = async (email) => {
  const response = await fetch(`${API_BASE_URL}/EmailVerification`, {
    method: "POST",
    headers: getPublicHeaders(),
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Email already exists or could not send OTP.");
  }
  return data;
};

export const emailVerifyOtp = async (email, emailotp) => {
  const response = await fetch(`${API_BASE_URL}/EmailVerifyOtp`, {
    method: "POST",
    headers: getPublicHeaders(),
    body: JSON.stringify({ email, otp: emailotp }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Invalid email OTP. Please try again.");
  }
  return data;
};

export const loginSendOtp = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/Login`, {
    method: "POST",
    headers: getPublicHeaders(),
    body: JSON.stringify({ ph: phone }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  return data;
};

export const SignupSendOtp = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/RegistrationPhoneSendOtp`, {
    method: "POST",
    headers: getPublicHeaders(),
    body: JSON.stringify({ ph: phone }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  return data;
};
export const loginVerifyOtp = async (phone, otp) => {

  const response = await fetch(`${API_BASE_URL}/VerifyOtp`, {
    method: "POST",
    headers: getPublicHeaders(),
    body: JSON.stringify({
      ph: Number(phone),
      otp: Number(otp)
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  // Save token
  if (data.token) {
    setAuthToken(data.token);
  }

  const user = data.user || data.data || {};

  setUserData({
    _id: user._id || user.id,
    phone: user.phone || phone,
    name: user.name || "",
    lastName: user.lastName || "",
   email:
  user.email ||
  user.email_id ||
  user.userEmail ||
  "",
    labName: user.labName || "",
   type: user.type,
    approvalStatus: user.approvalStatus || "pending"
  });

  return data;
};
export const getMemberProfile = async (userId) => {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(`${API_BASE_URL}/members?_id=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch member profile: ${response.status}`);
  }

  const data = await response.json();

  return data;
};
export async function getMemberStatus() {
  const token = localStorage.getItem("auth_token");
  
  const response = await fetch(`${API_BASE_URL}/membersStatus`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  
  const data = await response.json();
  return data;
}
export const registrationPhoneVerify = async ({
  phone,
  otp,
  name,
  lastName,
  email,
  labName,
  district,
  taluka,
  type
}) => {

  const response = await fetch(`${API_BASE_URL}/RegistrationPhoneverify`, {
    method: "POST",
    headers: getPublicHeaders(),
    body: JSON.stringify({
     ph: Number(phone),
      otp: Number(otp),
      name: name,
      lastName: lastName,
      email: email,
      labName: labName,
       district: district,
 taluka: taluka,
     type: type 
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Registration failed. Please try again.");
  }

return data;
};

// ─────────────────────────────────────────────
// 📱 ACCOUNT PHONE UPDATE
// ─────────────────────────────────────────────

export const updateAccountPhoneSendOtp = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/RegistrationPhoneSendOtp`, {
    method: "POST",
    headers: getPublicHeaders(),
    body: JSON.stringify({ ph: phone }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to send OTP");
  }
  return data;
};

export const updateAccountPhoneVerifyOtp = async ({ userId, phoneNumber, otp }) => {
  const authToken = localStorage.getItem("auth_token");
const payload = {
  _id: userId,
  phoneNumber: Number(phoneNumber),
  otp: Number(otp),
};
  const response = await fetch(`${API_BASE_URL}/verifyAndUpdateaccountPhone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (response.ok && data.success) return data;
  throw new Error(data.message || data.error || `HTTP ${response.status}`);
};

// ─────────────────────────────────────────────
// 🔒 PROTECTED endpoints (token required)
// ─────────────────────────────────────────────

export const registerMember = async ({ name, lastName, email, phoneNumber, type, labName }) => {
  const response = await fetch(`${API_BASE_URL}/members`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, lastName, email, phoneNumber, type, labName }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `API Error: ${response.status}`);
  }
  return await response.json();
};

export const fetchMembers = async () => {
  const response = await fetch(`${API_BASE_URL}/members`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(`API failed: ${response.status} - ${errJson.message || ""}`);
  }
  const data = await response.json();

  let list = [];
  if (Array.isArray(data))               list = data;
  else if (Array.isArray(data?.items))   list = data.items;
  else if (Array.isArray(data?.members)) list = data.members;
  else if (Array.isArray(data?.data))    list = data.data;
  else {
    const firstArray = Object.values(data).find((v) => Array.isArray(v));
    if (firstArray) list = firstArray;
  }

return list;
};
export const fetchTestData = async () => {

  const user = JSON.parse(localStorage.getItem("user_data") || "{}");

  const response = await fetch(
    `${API_BASE_URL}/test_data?labId=${user._id}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`API failed: ${response.status}`);
  }

  const data = await response.json();

  if (data?.totaltest?.items) {
    return data.totaltest.items;
  }

  return [];
};
export const addTest = async ({ material, test, unit, price, expiredDate }) => {
  const response = await fetch(`${API_BASE_URL}/add_test`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      material,
      test,
      unit,
      price: Number(price),
      expiredDate
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(`API failed: ${response.status} - ${errJson.message || ""}`);
  }

  return await response.json();
};

export const deleteTest = async (id) => {

  const response = await fetch(`${API_BASE_URL}/delete_test`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      _id: id
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Delete failed");
  }

  return data;
};

export const fetchDashboardData = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard_data`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return await response.json();
};
export const fetchContractorMember = async (userId) => {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(
    `${API_BASE_URL}/Contractormembers?userId=${userId}`, // ✅ this is correct
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Contractor API failed: ${response.status}`);
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [data];
};

export const fetchMaterials = async () => {
  const response = await fetch(`${API_BASE_URL}/material`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(`API failed: ${response.status} - ${errJson.message || ""}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : (data?.items || []);
};

export const transformApiData = (apiResponse) => {
 
  let items = [];

  if (apiResponse?.totalTest?.items) items = apiResponse.totalTest.items;
  else if (apiResponse?.items) items = apiResponse.items;
  else if (apiResponse?.data) items = apiResponse.data;
  else if (apiResponse?.bookingData) items = apiResponse.bookingData;
  else if (Array.isArray(apiResponse)) items = apiResponse;

  if (!items.length) return [];

  return items.map((item) => {

    let finalStatus = "Pending";
    if (item.status === "reject") finalStatus = "Rejected";
    else if (item.insepectorStatus === "Done") finalStatus = "Approved";

    // ✅ Build materialName array from testingMaterial + test arrays
    const tests    = Array.isArray(item.test)            ? item.test            : [];
    const materials = Array.isArray(item.testingMaterial) ? item.testingMaterial : [];

    const materialName = materials.length > 0
      ? materials.map((mat, i) => ({
          category: mat,
          tests: tests[i] ? [tests[i]] : []
        }))
      : tests.length > 0
        ? tests.map((t) => ({
            category: t,
            tests: []
          }))
        : [];

    return {
      id:    item._id || item.id,
      userId: item.userId || item._owner || item.contractorId || "",

      workName: item.nameOfWork || item.workName || "N/A",

      // ✅ Now always an array of { category, tests[] }
      materialName,

      price:
        item.totalAmount ||
        item.workOrderAmount ||
        item.amount ||
        0,

      panNumber:
        item.panNumber ||
        item.pan_number ||
        item.contractorPan ||
        "",

      aadhaarNumber:
        item.aadhaarNumber ||
        item.aadharNumber ||
        item.contractorAadhar ||
        "",

      registrationNumber:
        item.registrationNumber ||
        item.regNumber ||
        item.registration_no ||
        "",

      taluka:
        item.selectDivision ||
        item.taluka ||
        "",

      contractorName:
        item.contractorName ||
        item.contractor_name ||
        item.userEmail?.split("@")[0] ||
        "",

      totalAmount:
        item.workOrderAmount ||
        item.totalAmount ||
        item.amount ||
        0,

      status: finalStatus,

      rejectionReason:
        item.reason ||
        item.rejectionReason ||
        "",

      documents: [
        (item.workOrderDocument || item.workOrder || item.document) && {
          name: "Work Order",
          url:  item.workOrderDocument || item.workOrder || item.document,
        },
        (item.report || item.reportFile) && {
          name: "Report",
          url:  item.report || item.reportFile,
        },
      ].filter(Boolean),

      materials: item.materials || item.materialData || [],
    };
  });
};
export const labNameVerification = async (labName) => {
  const response = await fetch(`${API_BASE_URL}/LabNameVerification`, {
    method: "POST",
    headers: getPublicHeaders(),
    body: JSON.stringify({ labName }),
  });
  const data = await response.json();
  return data;
};

// ─────────────────────────────────────────────
// 📋 REPORT UPLOAD ENDPOINTS
// ─────────────────────────────────────────────

/**
 * STEP 1: Upload a PDF to Wix media storage.
 * Returns { fileUrl, publicUrl, qrCodeUrl }
 * - fileUrl:   wix:document://... (for storing in DB)
 * - publicUrl: https://static.wixstatic.com/ugd/... (for pdf-lib to fetch)
 * - qrCodeUrl: QR image URL pointing to publicUrl
 */// ─────────────────────────────────────────────
// 📋 REPORT UPLOAD ENDPOINTS
// ─────────────────────────────────────────────


// ✅ ADD THESE TWO APIs HERE

export const post_uploadReport = async (file) => {

  const formData = new FormData();
  formData.append("file", file);

  const token = requireAuthToken();

  const response = await fetch(`${API_BASE_URL}/uploadReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${text}`);
  }

  const data = await response.json();
  return data;
};


export const post_uploadFilewithQR = async ({
  bookingId,
  fileUrl,
  editUrl,
  qrCodeUrl
}) => {

  const response = await fetch(`${API_BASE_URL}/uploadFilewithQR`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      bookingId,
      fileUrl,
      editUrl,
      qrCodeUrl
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data;
};
export const uploadReport = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = requireAuthToken();

  const response = await fetch(`${API_BASE_URL}/uploadReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }

  const data = await response.json();

  // FIX: accept either fileUrl or publicUrl
  if (!data.fileUrl && !data.publicUrl) {
    throw new Error("Upload succeeded but response missing file URL");
  }

  return {
    fileUrl: data.fileUrl || null,
    publicUrl: data.publicUrl || data.fileUrl,
    qrCodeUrl: data.qrCodeUrl || null,
  };
};

/**
 * STEP 2: Upload a blob (QR-stamped PDF) to Wix media storage.
 * Same endpoint as uploadReport, accepts a Blob instead of File.
 * Returns { fileUrl, publicUrl, qrCodeUrl }
 */
export const uploadReportBlob = async (blob, fileName) => {
  const formData = new FormData();
  formData.append("file", blob, fileName);

  const token = requireAuthToken();

  const response = await fetch(`${API_BASE_URL}/uploadReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Blob upload failed (${response.status})`);
  }

  const data = await response.json();
  return data;
};

/**
 * STEP 3: Save the QR-stamped PDF url to the booking record.
 * Endpoint: POST /uploadFilewithQR
 * Body: { bookingId, fileUrl, editUrl }
 */
export const submitReportWithQR = async ({ bookingId, fileUrl, editUrl, qrCodeUrl }) => {
  const response = await fetch(`${API_BASE_URL}/uploadFilewithQR`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookingId, fileUrl, editUrl, qrCodeUrl }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const errorMsg = errJson.error || errJson.message || `HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data;
};

// ─────────────────────────────────────────────
// 📋 REPORT APPROVAL ENDPOINTS
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// 📋 REPORT APPROVAL ENDPOINTS
// ─────────────────────────────────────────────

// ⭐ NEW API
export const getMembersStatus = async () => {

  const token = localStorage.getItem("auth_token");

  const response = await fetch(
    `${API_BASE_URL}/membersStatus`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Members status API failed: ${response.status}`);
  }

  const data = await response.json();

  return data;
};



export const fetchInspectorDashboard = async () => {
  const response = await fetch(`${API_BASE_URL}/inspector_dashboard`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(`API failed: ${response.status} - ${errJson.message || ""}`);
  }

  const data = await response.json();

  let items = [];
  if (data?.totalTest?.items && Array.isArray(data.totalTest.items))   items = data.totalTest.items;
  else if (data?.items && Array.isArray(data.items))                   items = data.items;
  else if (data?.data && Array.isArray(data.data))                     items = data.data;
  else if (Array.isArray(data))                                        items = data;
  else if (data?.reports && Array.isArray(data.reports))               items = data.reports;
  else if (data?.bookingData && Array.isArray(data.bookingData))       items = data.bookingData;
  else {
    const arrayProps = Object.keys(data).filter((key) => Array.isArray(data[key]));
    if (arrayProps.length > 0) items = data[arrayProps[0]];
  }

  return items.map((item) => ({
    id: item._id,
    workName: item.nameOfWork,
    userName: item.userName,
    contractorName:
  item.contractorName ||
  item.contractor_name ||
  item.userEmail?.split("@")[0] ||
  "",
  editUrl: item.editUrl,
    createdDate:item.createdDate,
    totalAmount: item.totalAmount || 0,
    status: item.status,
    insepectorStatus: item.insepectorStatus,
    reason: item.reason || "",
    documents: [
      item.workOrderDocument && { name: "Work Order", url: item.workOrderDocument },
      item.report           && { name: "Report",      url: item.report },
    ].filter(Boolean),
  }));
};

export const acceptReport = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/acceptReport`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookingId }),
  });
  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || errJson.message || `HTTP ${response.status}`);
  }
  return await response.json();
};
export const checkLabMemberLimit = async () => {

  const token = localStorage.getItem("auth_token");

  if (!token) {
    return { memberExists: false };
  }

  const response = await fetch(
    `${API_BASE_URL}/lab_member_limit`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return { memberExists: false };
  }

  return data;
};
export const fetchInspectorByLabName = async () => {

  const token = localStorage.getItem("auth_token");

  const response = await fetch(
    `${API_BASE_URL}/inspector`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Inspector API failed: ${response.status}`);
  }

  const data = await response.json();

return Array.isArray(data) ? data : [data];
};
export const rejectReport = async (bookingId, reason) => {
  const response = await fetch(`${API_BASE_URL}/rejectReport`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookingId, reason }),
  });
  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || errJson.message || `HTTP ${response.status}`);
  }
  return await response.json();
};
export const deleteMember = async (id) => {

  const token = localStorage.getItem("auth_token");

  const response = await fetch(
    `${API_BASE_URL}/delete_member`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        _id: id
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Delete failed");
  }

  return data;
};
export default {
  setAuthToken,
  setUserData,
  getUserData,
  isAuthenticated,
  logout,
  emailVerification,
  emailVerifyOtp,
  loginSendOtp,
  loginVerifyOtp,
  registrationPhoneVerify,
  updateAccountPhoneSendOtp,
  updateAccountPhoneVerifyOtp,
  registerMember,
  fetchMembers,
  addTest,
  deleteTest,
  fetchDashboardData,
  fetchMaterials,
  transformApiData,
  fetchTestData,
  fetchDistrictTaluka,
  labNameVerification,

  // Report upload
  uploadReport,
  uploadReportBlob,
  submitReportWithQR,

  // NEW APIs
  post_uploadReport,
  post_uploadFilewithQR,

  // Inspector
  fetchInspectorDashboard,
  acceptReport,

  rejectReport,
    getMembersStatus,
    checkLabMemberLimit,
};