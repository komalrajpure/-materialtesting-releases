import {
  X,
  FileText,
  Upload,
  Download,
  ChevronDown,
  QrCode,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { fetchContractorMember } from "../../../services/api";
import {
  uploadReport,
  uploadReportBlob,
  submitReportWithQR,
} from "../../../services/api";

// ─── Build QR image URL from any public URL ───────────────────────────────────
const makeQrUrl = (publicUrl) =>
  `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(publicUrl)}&size=200x200&format=png`;

// ─── Fetch an image and return ArrayBuffer, with CORS fallback ────────────────
const fetchImageBytes = async (url) => {
  try {
    const res = await fetch(url);
    if (res.ok) return await res.arrayBuffer();
  } catch (_) {}

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 200;
      canvas.height = img.naturalHeight || 200;
      canvas.getContext("2d").drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
        blob.arrayBuffer().then(resolve).catch(reject);
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Image load failed: " + url));
    img.src = url;
  });
};

// ─── Stamp QR onto every page of a pdf-lib PDFDocument ───────────────────────
const stampQROnDoc = async (pdfDoc, qrCodeUrl) => {
  const qrBytes = await fetchImageBytes(qrCodeUrl);
  const qrImage = await pdfDoc.embedPng(qrBytes);
  for (const page of pdfDoc.getPages()) {
    const { height } = page.getSize();
    page.drawImage(qrImage, {
      x: 30,
      y: height - 30 - 50,
      width: 50,
      height: 50,
    });
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const TestDetailModal = ({ test, onClose }) => {
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedReport, setUploadedReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false); 

  const toggle = useCallback((cat) => {
    setExpandedCategories((p) =>
      p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat],
    );
  }, []);

  const [contractor, setContractor] = useState(null);

  if (!test) return null;

  console.log("MODAL TEST DATA:", test);

  const isApproved = test?.status?.toLowerCase() === "approved";

useEffect(() => {
  const loadContractor = async () => {
    if (!test?.userId) {
      console.log("❌ userId missing in test object:", test);
      return;
    }
    try {
      const data = await fetchContractorMember(test.userId);
      setContractor(data[0] || null); // ✅ first item from SignUp
    } catch (err) {
      console.error("❌ Contractor fetch failed:", err.message);
    }
  };
  loadContractor();
}, [test]);

  const busy = uploading || submitting;

  // ── STEP 1: Upload PDF ──────────────────────────────────────────────────────
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setInlineError("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setInlineError("File size must be less than 5MB.");
      return;
    }

    setInlineError("");
    setUploading(true);
    setUploadProgress(0);
    setUploadedReport(null);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 85 ? 85 : prev + 10));
    }, 300);

    try {
      const data = await uploadReport(file);
      clearInterval(progressInterval);
      const qrCodeUrl = makeQrUrl(data.publicUrl);
      console.log("🔗 QR Code URL:", qrCodeUrl);
      setUploadProgress(100);
      setUploadedReport({
        fileUrl: data.fileUrl,
        publicUrl: data.publicUrl,
        qrCodeUrl,
        fileName: file.name,
      });
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload error:", error);
      setInlineError("Failed to upload file: " + error.message);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ── STEP 2: Download PDF with QR stamped ───────────────────────────────────
  const handleDownloadWithQR = async () => {
    if (!uploadedReport) return;
    setDownloading(true);
    setInlineError("");
    try {
      const pdfRes = await fetch(uploadedReport.publicUrl);
      if (!pdfRes.ok) throw new Error("Failed to fetch PDF");
      const pdfDoc = await PDFDocument.load(await pdfRes.arrayBuffer());
      await stampQROnDoc(pdfDoc, uploadedReport.qrCodeUrl);
      const blob = new Blob([await pdfDoc.save()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-${uploadedReport.fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setInlineError("Failed to generate PDF with QR: " + error.message);
    } finally {
      setDownloading(false);
    }
  };

  // ── STEP 3: Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!uploadedReport) return;
    setSubmitting(true);
    setInlineError("");
    try {
      const pdfRes = await fetch(uploadedReport.publicUrl);
      if (!pdfRes.ok) throw new Error("Failed to fetch original PDF");
      const pdfDoc = await PDFDocument.load(await pdfRes.arrayBuffer());
      await stampQROnDoc(pdfDoc, uploadedReport.qrCodeUrl);
      const modifiedBlob = new Blob([await pdfDoc.save()], { type: "application/pdf" });
      const uploadData = await uploadReportBlob(modifiedBlob, `QR-${uploadedReport.fileName}`);
      await submitReportWithQR({
        bookingId: test.id,
        fileUrl: uploadData.fileUrl,
        editUrl: `${window.location.origin}/edit-report/${test.id}`,
        qrCodeUrl: uploadedReport.qrCodeUrl,
      });
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Submission error:", error);
     
      setInlineError("Failed to submit report: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto",
          borderRadius: 20, background: "#fff",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)", border: "1px solid #f0ede6",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #f0ede6",
          background: "linear-gradient(90deg,#fffdf0,#fff)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: "#fffbeb",
              border: "1.5px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText size={18} color="#b45309" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#111", margin: 0 }}>Report Details</h2>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontWeight: 500 }}>
                {test.workName || "N/A"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "none", cursor: "pointer" }}>
            <X size={18} color="#9ca3af" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px" }}>

          {/* ✅ INLINE ERROR BANNER */}
          {inlineError && (
            <div style={{
              marginBottom: 16, padding: "12px 16px", borderRadius: 10,
              background: "#fef2f2", border: "1.5px solid #fecaca",
              fontSize: 13, fontWeight: 700, color: "#dc2626",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ⚠ {inlineError}
            </div>
          )}

          {/* ✅ INLINE SUCCESS BANNER */}
          {submitSuccess && (
            <div style={{
              marginBottom: 16, padding: "12px 16px", borderRadius: 10,
              background: "#dcfce7", border: "1.5px solid #bbf7d0",
              fontSize: 13, fontWeight: 700, color: "#16a34a",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ✓ Report submitted successfully!
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {/* Left */}
            <div>
              <SL>Contractor Info</SL>
              <D label="PAN Number" value={contractor?.panNumber} />
              <D label="Aadhaar Number" value={contractor?.aadharNumber} />
              <D label="Registration Number" value={contractor?.regitrationNumber} />
              <D label="Taluka" value={contractor?.taluka} />
              <D label="Contractor Name" value={contractor?.contractorName} />
              <div style={{
                borderRadius: 12, padding: "14px 16px",
                background: "#fffbeb", border: "1.5px solid #fde68a", marginTop: 4,
              }}>
                <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".16em", color: "#b45309", marginBottom: 4 }}>
                  Total Amount
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#111" }}>
                  ₹{(test.price || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Documents */}
              <div>
                <SL>Documents</SL>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  {test.documents?.length > 0 ? (
                    test.documents.map((doc, i) => (
                      <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "11px 14px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                          background: "linear-gradient(135deg,#f5c100,#e6a800)",
                          color: "#1a0f00", border: "1.5px solid #e6a800", textDecoration: "none",
                        }}
                      >
                        <FileText size={15} />
                        {doc.name}
                      </a>
                    ))
                  ) : (
                    <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>No documents available</p>
                  )}
                </div>
              </div>

              {/* Materials */}
              <div>
                <SL>Material & Test</SL>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {test.materialName
?.length > 0 ? (
                    test.materialName
.map((mat, i) => {
                      const open = expandedCategories.includes(mat.category);
                      return (
                        <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid #f0ede6" }}>
                          <button
                            onClick={() => toggle(mat.category)}
                            style={{
                              width: "100%", display: "flex", alignItems: "center",
                              justifyContent: "space-between", padding: "11px 14px",
                              background: "#fafaf8", border: "none", cursor: "pointer",
                              fontSize: 12, fontWeight: 700,
                            }}
                          >
                            <span>{mat.category}</span>
                            <ChevronDown size={15} color="#9ca3af" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                          </button>
                          {open && (
                            <div style={{ padding: "10px 14px", background: "#fff" }}>
                              {mat.tests?.map((t, j) => (
                                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4b5563", padding: "3px 0" }}>
                                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f5c100", flexShrink: 0 }} />
                                  {t}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>No material data</p>
                  )}
                </div>
              </div>

              {/* Upload */}
              <div>
                <SL>Upload Report (PDF only, max 5MB)</SL>
                <div style={{ marginTop: 8 }}>
                  <input
                    type="file" accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    disabled={busy || isApproved}
                    id="file-upload" style={{ display: "none" }}
                  />
                  <label
                    htmlFor={!isApproved ? "file-upload" : undefined}
                    title={isApproved ? "Your report is already approved" : ""}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 8, padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 800,
                      background: isApproved ? "#e5e7eb" : busy ? "#e5e7eb" : "linear-gradient(135deg,#f5c100,#e6a800)",
                      color: isApproved ? "#6b7280" : busy ? "#9ca3af" : "#1a0f00",
                      border: `2px dashed ${isApproved ? "#d1d5db" : busy ? "#d1d5db" : "#e6a800"}`,
                      cursor: isApproved ? "not-allowed" : busy ? "not-allowed" : "pointer",
                    }}
                  >
                    <Upload size={15} />
                    {isApproved
                      ? "Report Already Approved"
                      : uploading
                        ? `Uploading… ${uploadProgress}%`
                        : uploadedReport
                          ? "✓ Uploaded — Click to Replace"
                          : "Choose PDF to Upload"}
                  </label>

                  {/* Progress bar */}
                  {uploading && (
                    <div style={{ marginTop: 8, height: 4, background: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${uploadProgress}%`, height: "100%", background: "#f5c100", transition: "width 0.3s ease" }} />
                    </div>
                  )}

                  {/* Success state with QR preview */}
                  {uploadedReport && !uploading && (
                    <div style={{ marginTop: 10, padding: "12px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <img src={uploadedReport.qrCodeUrl} alt="QR Code" width={56} height={56}
                          style={{ borderRadius: 6, border: "1px solid #d1fae5", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <FileText size={13} color="#16a34a" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {uploadedReport.fileName}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginBottom: 6 }}>✓ QR Generated</div>
                          <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                            <a href={uploadedReport.publicUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#b45309", textDecoration: "underline" }}>View PDF</a>
                            <a href={uploadedReport.qrCodeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#b45309", textDecoration: "underline" }}>View QR</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "14px 24px", borderTop: "1px solid #f0ede6", background: "#fafaf8",
        }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              padding: "9px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb",
              fontSize: 12, fontWeight: 700, background: "#fff", color: "#6b7280", cursor: "pointer",
            }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!uploadedReport || submitting || isApproved}
              style={{
                padding: "9px 24px", borderRadius: 10, border: "none",
                fontSize: 12, fontWeight: 800,
                background: uploadedReport && !submitting ? "#f5c100" : "#e5e7eb",
                color: uploadedReport && !submitting ? "#1a0f00" : "#9ca3af",
                cursor: uploadedReport && !submitting ? "pointer" : "not-allowed",
                opacity: submitting ? 0.75 : 1,
              }}
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SL = ({ children }) => (
  <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".18em", color: "#1f2937", margin: "0 0 10px" }}>
    {children}
  </p>
);

const D = ({ label, value }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 12, fontWeight: 500, color: value && value !== "N/A" ? "#374151" : "#9ca3af" }}>
      {value || "N/A"}
    </div>
  </div>
);

export default TestDetailModal;