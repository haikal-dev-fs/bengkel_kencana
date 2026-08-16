"use client";
import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("bengkel-theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("bengkel-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Prevent hydration mismatch by not rendering the slider position until mounted
  if (!theme) return <div className="theme-toggle" style={{ visibility: "hidden" }}><button className="toggle-btn">Dark</button><button className="toggle-btn">Light</button></div>;

  return (
    <div className="theme-toggle">
      <div className={`toggle-slider ${theme === 'light' ? 'right' : 'left'}`}></div>
      <button 
        type="button"
        className={`toggle-btn ${theme === 'dark' ? 'active' : ''}`} 
        onClick={() => toggleTheme('dark')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        Dark
      </button>
      <button 
        type="button"
        className={`toggle-btn ${theme === 'light' ? 'active' : ''}`} 
        onClick={() => toggleTheme('light')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        Light
      </button>
    </div>
  );
}
