// FetchBill.js

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "http://localhost:4000";

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).toLowerCase());

export default function FetchBill() {
  const [billNumber, setBillNumber] = useState("");
  const [bill, setBill] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Pay-by-link state
  const [linkUrl, setLinkUrl] = useState("");
  const [showQR, setShowQR] = useState(false);

  // Email state
  const [emailInput, setEmailInput] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  const resetActions = () => {
    setLinkUrl("");
    setShowQR(false);
    setMessage("");
  };

  // 🔹 Fetch Bill
  const fetchBill = async () => {
    if (!billNumber.trim()) {
      setMessage("Please enter a bill number.");
      return;
    }
    try {
      setLoading(true);
      resetActions();

      // 1. Try from DB
      try {
        const res = await axios.get(`${API}/api/bills/${billNumber.trim()}`);
        setBill(res.data);
        setEmailInput(res.data.email || "");
        setMessage("Bill loaded from database!");
        return;
      } catch (err) {
        // not in DB → continue
      }

      // 2. If not found, fetch from mock bank
      const res = await axios.post(`${API}/api/bills/fetch`, {
        bill_number: billNumber.trim(),
      });
      setBill(res.data.bill);
      setEmailInput(res.data.bill?.email || "");
      setMessage("Bill fetched from mock bank!");
    } catch (err) {
      setBill(null);
      setMessage("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Create payment link
  const createPayLink = async () => {
    if (!bill) return;
    try {
      setLoading(true);
      setShowQR(false);
      setLinkUrl("");

      const res = await axios.post(`${API}/api/paylinks`, {
        bill_number: bill.bill_number,
      });

      const url = res.data.link_url;
      setLinkUrl(url || "");
      setMessage("Payment link created.");

      // ⬅️ pull fresh bill so UI shows LINK_SENT
      const refreshed = await axios.get(`${API}/api/bills/${bill.bill_number}`);
      setBill(refreshed.data);
    } catch (err) {
      setMessage("Error creating payment link.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Copy payment link
  const copyUrl = async () => {
    if (!linkUrl) return;
    try {
      await navigator.clipboard.writeText(linkUrl);
      toast.success("✅ Link URL copied to clipboard.");
    } catch {
      toast.error("❌ Could not copy. Please copy manually.");
    }
  };

  // 🔹 Toggle QR view
  const toggleQR = () => setShowQR((s) => !s);

  // 🔹 Send Email
  const sendEmail = async () => {
    if (!bill) return;
    const to = emailInput.trim();
    if (!isValidEmail(to)) {
      toast.error("❌ Please enter a valid email.");
      return;
    }
    try {
      setEmailBusy(true);
      const res = await axios.post(`${API}/api/email/paylink`, {
        bill_number: bill.bill_number,
        to_email: to,
      });
      if (res.ok || res.data.ok) {
        toast.success(`✅ Email sent to ${res.data.email_log?.to_email || to}`);
      } else {
        toast.error(`❌ Failed: ${res.data.detail || res.data.error}`);
      }
    } catch (err) {
      toast.error("❌ Email send failed (bounce or network error).");
    } finally {
      setEmailBusy(false);
    }
  };

  // 🔹 Refresh status from DB
  const refreshStatus = async () => {
    if (!bill) return;
    try {
      const res = await axios.get(`${API}/api/bills/${bill.bill_number}`);
      setBill(res.data);
      setMessage("Bill status refreshed!");
    } catch {
      setMessage("Error refreshing status.");
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px" }}>
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>Fetch Bill</h2>

      {/* Search Row */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <input
          value={billNumber}
          onChange={(e) => setBillNumber(e.target.value)}
          placeholder="Enter bill number"
          style={{
            padding: "12px",
            width: 320,
            borderRadius: 8,
            border: "1px solid #d0d7de",
            fontSize: 14,
          }}
        />
        <button
          onClick={fetchBill}
          disabled={loading}
          style={{
            padding: "12px 18px",
            borderRadius: 8,
            border: "none",
            background: "#0d6efd",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Loading..." : "Fetch"}
        </button>
      </div>

      {/* Bill Card */}
      {bill && (
        <div
          style={{
            marginTop: 24,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
            padding: 20,
            background: "#fff",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Bill Details</h3>

          <div style={{ lineHeight: 1.9 }}>
            <div><b>Bill #:</b> {bill.bill_number}</div>
            <div><b>Consumer:</b> {bill.consumer_name}</div>
            <div><b>Email:</b> {bill.email}</div>
            <div><b>Address:</b> {bill.address}</div>
            <div>
              <b>Period:</b> {bill.service_period_start} → {bill.service_period_end}
            </div>
            <div><b>Due date:</b> {bill.due_date}</div>
            <div><b>Total:</b> ₹{bill.total_amount}</div>
            <div>
              <b>Status:</b>{" "}
              <span
                style={{
                  background:
                    bill.status === "PAID"
                      ? "#e6ffed"
                      : bill.status === "EXPIRED"
                      ? "#ffe6e6"
                      : bill.status === "LINK_SENT"
                      ? "#fff7e6"
                      : bill.status === "PAYMENT_PENDING"
                      ? "#e6f2ff"
                      : "#f3f4f6",
                  color:
                    bill.status === "PAID"
                      ? "#1a7f37"
                      : bill.status === "EXPIRED"
                      ? "#d32f2f"
                      : bill.status === "LINK_SENT"
                      ? "#9a6700"
                      : bill.status === "PAYMENT_PENDING"
                      ? "#0d6efd"
                      : "#111827",
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {bill.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={createPayLink}
              disabled={loading || bill.status === "EXPIRED" || bill.status === "PAID"}
            >
              Create Payment Link
            </button>
            <button onClick={refreshStatus} disabled={loading}>Refresh Status</button>
          </div>

          {/* Payment link + QR + Email */}
          {linkUrl && (
            <div style={{ marginTop: 18, borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>Payment Link</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input readOnly value={linkUrl} style={{ flex: "1 1 360px", padding: 10 }} />
                <button onClick={copyUrl}>Copy URL</button>
                <button onClick={toggleQR}>{showQR ? "Hide QR" : "Show QR"}</button>
              </div>
              {showQR && (
                <div style={{ marginTop: 12 }}>
                  <img
                    alt="QR"
                    width="180"
                    height="180"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(linkUrl)}`}
                    style={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
                  />
                </div>
              )}
              {/* Email */}
              <div style={{ marginTop: 16, display: "grid", gap: 8, maxWidth: 520 }}>
                <label style={{ fontWeight: 700 }}>Send link to customer</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="customer@email.com"
                  />
                  <button
                    onClick={sendEmail}
                    disabled={emailBusy || bill.status === "EXPIRED" || bill.status === "PAID"}
                  >
                    {emailBusy ? "Sending..." : "Send Email"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {message && <p style={{ color: "#0d6efd", marginTop: 16, textAlign: "center" }}>{message}</p>}
    </div>
  );
}
