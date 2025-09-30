// App.js
import React, { useState } from "react";
import FetchBill from "./components/FetchBill";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [page, setPage] = useState("fetch");

  return (
    <div className="app">
      <header className="header">
        <h1>Water Bill Payments</h1>
      </header>

      <nav className="navbar">
        <button
          className={page === "fetch" ? "active" : ""}
          onClick={() => setPage("fetch")}
        >
          Fetch Bill
        </button>
        <button
          className={page === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>
      </nav>

      <main className="main">
        <div className="card">
          {page === "fetch" && <FetchBill />}
          {page === "dashboard" && <Dashboard />}
        </div>
      </main>

      {/* ✅ Toast container goes here */}
      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
}

export default App;
