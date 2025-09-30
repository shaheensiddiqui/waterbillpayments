// src/components/Dashboard.js

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "http://localhost:4000";

export default function Dashboard() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  // ✅ loadBills wrapped in useCallback
  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await axios.get(`${API}/api/bills`, { params });
      setBills(res.data);
    } catch (err) {
      setMessage("Error loading bills.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadBills();
  }, [loadBills]); // ✅ no eslint warning

  // 🔹 Resend Payment Link
  const resendLink = async (bill) => {
    try {
      if (!bill.email) {
        toast.error("❌ No customer email found for this bill.");
        return;
      }

      const res = await axios.post(`${API}/api/email/paylink`, {
        bill_number: bill.bill_number,
        to_email: bill.email,
      });

      if (res.status === 200) {
        toast.success(`✅ Link resent to ${bill.email}`);
      } else {
        toast.error("❌ Failed to resend link.");
      }
    } catch (err) {
      toast.error("❌ Error resending link.");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h2 style={{ textAlign: "center" }}>📊 Dashboard</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="">All statuses</option>
          <option value="CREATED">CREATED</option>
          <option value="LINK_SENT">LINK_SENT</option>
          <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
          <option value="PAID">PAID</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by bill number"
          style={{ padding: 8, flex: "1" }}
        />

        <button onClick={loadBills} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <p style={{ color: "#ef4444", marginBottom: 16, textAlign: "center" }}>
          {message}
        </p>
      )}

      {/* Bills Table */}
      <table
        border="1"
        cellPadding="8"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <thead style={{ background: "#f9fafb" }}>
          <tr>
            <th>Bill Number</th>
            <th>Consumer</th>
            <th>Email</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th> {/* 🔹 new column */}
          </tr>
        </thead>
        <tbody>
          {bills.length > 0 ? (
            bills.map((b) => (
              <tr key={b.id}>
                <td>{b.bill_number}</td>
                <td>{b.consumer_name}</td>
                <td>{b.email}</td>
                <td>₹{b.total_amount}</td>
                <td>
                  <span
                    style={{
                      background:
                        b.status === "PAID"
                          ? "#e6ffed"
                          : b.status === "LINK_SENT"
                          ? "#fff7e6"
                          : b.status === "PAYMENT_PENDING"
                          ? "#e6f2ff"
                          : b.status === "EXPIRED"
                          ? "#fde2e1"
                          : "#f3f4f6",
                      color:
                        b.status === "PAID"
                          ? "#1a7f37"
                          : b.status === "LINK_SENT"
                          ? "#9a6700"
                          : b.status === "PAYMENT_PENDING"
                          ? "#0d6efd"
                          : b.status === "EXPIRED"
                          ? "#d32f2f"
                          : "#111827",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {b.status}
                  </span>
                </td>
                <td>
                  {(b.status === "LINK_SENT" ||
                    b.status === "PAYMENT_PENDING") && (
                    <button onClick={() => resendLink(b)}>Resend Link</button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: 16 }}>
                No bills found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
