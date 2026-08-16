"use client";
import React, { useState } from "react";
import { unlockSystem } from "@/app/actions";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await unlockSystem(password);
      if (res.success) {
        window.location.href = "/";
      } else {
        Swal.fire("Akses Ditolak", "Password yang Anda masukkan salah!", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "var(--bg-color)"
    }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px", textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1rem" }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>Sistem Terkunci</h1>
          <p className="text-muted" style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>Masukkan password untuk mengakses Bengkel Pro.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "0.2rem" }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "0.75rem", fontSize: "1.1rem" }}>
            {loading ? "Membuka..." : "Buka Sistem"}
          </button>
        </form>
      </div>
    </div>
  );
}
