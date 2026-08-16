"use client";
import React, { useState } from "react";

export default function CurrencyInput({
  name,
  required,
  className,
  defaultValue,
  value,
  onChange,
}: {
  name?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (val: string) => void;
}) {
  const [displayValue, setDisplayValue] = useState(() => {
    const initVal = value !== undefined ? value : defaultValue;
    if (initVal !== undefined && initVal !== null && initVal !== "") {
      return parseInt(initVal.toString().replace(/\D/g, ""), 10).toLocaleString("id-ID");
    }
    return "";
  });

  React.useEffect(() => {
    if (value !== undefined) {
      if (value === "" || value === null) {
        setDisplayValue("");
      } else {
        setDisplayValue(parseInt(value.toString().replace(/\D/g, ""), 10).toLocaleString("id-ID"));
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      setDisplayValue("");
      if (onChange) onChange("");
      return;
    }
    setDisplayValue(parseInt(val, 10).toLocaleString("id-ID"));
    if (onChange) onChange(val);
  };

  return (
    <>
      <input
        type="text"
        className={className}
        required={required}
        value={displayValue}
        onChange={handleChange}
        placeholder="0"
      />
      {name && <input type="hidden" name={name} value={displayValue.replace(/\D/g, "")} />}
    </>
  );
}
