"use client";
import React from "react";
import { lockSystem } from "@/app/actions";

export default function LogoutButton() {
  const handleLock = async () => {
    await lockSystem();
    window.location.href = "/login";
  };

  return (
    <button onClick={handleLock} className="nav-item" style={{ marginTop: "auto", color: "var(--danger)", border: "none", background: "none", cursor: "pointer", width: "100%", textAlign: "left", fontSize: "1rem", fontFamily: "inherit" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      Kunci Sistem
    </button>
  );
}
