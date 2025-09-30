import React, { useState } from "react";
import { toast } from "react-toastify";

function EmailLink({ bill }) {
  const [email, setEmail] = useState(bill?.email || "");
  const [loading, setLoading] = useState(false);

  const sendEmail = async () => {
    if (!email) {
      toast.error("❌ Please enter a valid email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/email/paylink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bill_number: bill.bill_number,
          to_email: email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Payment link sent successfully!");
      } else {
        toast.error(`❌ Failed: ${data.detail || data.error || "Something went wrong"}`);
      }
    } catch (err) {
      toast.error("❌ Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3>Email Payment Link</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter customer email"
        style={styles.input}
      />
      <button onClick={sendEmail} style={styles.button} disabled={loading}>
        {loading ? "Sending..." : "Send Email"}
      </button>
    </div>
  );
}
