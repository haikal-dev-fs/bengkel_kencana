"use client";
import React, { useState, useRef, useEffect } from "react";

type Option = {
  value: string;
  label: string;
};

export default function SearchableSelect({
  name,
  options,
  placeholder = "🔍 Ketik untuk mencari...",
  required = false,
  value,
  onChange
}: {
  name?: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (val: string) => void;
}) {
  const [internalValue, setInternalValue] = useState("");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const selectedValue = value !== undefined ? value : internalValue;

  // Listen to form reset
  useEffect(() => {
    const form = hiddenInputRef.current?.closest("form");
    const handleReset = () => {
      setInternalValue("");
      setSearch("");
    };
    form?.addEventListener("reset", handleReset);
    return () => form?.removeEventListener("reset", handleReset);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    if (value === undefined) setInternalValue(val);
    if (onChange) onChange(val);
    setSearch("");
    setIsOpen(false);
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      {name && (
        <input ref={hiddenInputRef} type="hidden" name={name} value={selectedValue} required={required} />
      )}
      
      <input
        type="text"
        className="form-input"
        placeholder={selectedOption ? selectedOption.label : placeholder}
        value={isOpen ? search : (selectedOption ? selectedOption.label : "")}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          if (selectedValue) {
            if (value === undefined) setInternalValue("");
            if (onChange) onChange("");
          }
        }}
        onFocus={() => setIsOpen(true)}
      />
      
      {isOpen && (
        <ul style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          maxHeight: "250px",
          overflowY: "auto",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          zIndex: 50,
          listStyle: "none",
          padding: "4px",
          margin: "4px 0 0 0",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
        }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  color: "var(--text-main)",
                  borderBottom: "1px solid var(--border)",
                  fontSize: "0.875rem"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li style={{ padding: "8px 12px", color: "var(--text-muted)", fontSize: "0.875rem" }}>Tidak ditemukan</li>
          )}
        </ul>
      )}
    </div>
  );
}
