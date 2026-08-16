"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function InvoiceClient({ transaction }: { transaction: any }) {
  const searchParams = useSearchParams();
  const autoAction = searchParams.get("action");

  useEffect(() => {
    if (autoAction === "print") {
      setTimeout(() => window.print(), 500);
    } else if (autoAction === "pdf") {
      setTimeout(() => handleDownloadPdf(), 500);
    }
  }, [autoAction]);

  const handleDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("invoice-content") as HTMLElement;
    const opt: any = {
      margin: 1,
      filename: `Nota_${transaction.woNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const totalTagihan = transaction.items.reduce((sum: number, item: any) => sum + (item.totalSelling || (item.qty * item.sellingPrice) || 0), 0);

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/* Action Buttons - Hidden when printing */}
      <div className="no-print" style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Nota</button>
        <button className="btn btn-success" onClick={handleDownloadPdf}>📄 Download PDF</button>
        <button className="btn btn-outline" onClick={() => window.close()}>Tutup</button>
      </div>

      {/* Invoice Content */}
      <div id="invoice-content" style={{ backgroundColor: "white", padding: "3rem", width: "100%", maxWidth: "800px", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", color: "#111" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #eee", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#2563eb" }}>BENGKEL PRO</h1>
            <p style={{ margin: "0.25rem 0", color: "#555" }}>Jl. Raya Otomotif No. 123, Kota Bengkel</p>
            <p style={{ margin: "0", color: "#555" }}>Telp: 0812-3456-7890</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0, color: "#333", textTransform: "uppercase" }}>Invoice / Nota</h2>
            <p style={{ margin: "0.25rem 0", fontWeight: "bold" }}>#{transaction.woNumber}</p>
            <p style={{ margin: 0, color: "#555" }}>Tanggal: {new Date(transaction.createdAt).toLocaleDateString("id-ID")}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>Informasi Pelanggan</h3>
          <div style={{ display: "flex", gap: "2rem" }}>
            <div>
              <p style={{ margin: "0.25rem 0", color: "#555" }}>Nama Pelanggan:</p>
              <p style={{ margin: 0, fontWeight: "bold" }}>{transaction.customerName}</p>
            </div>
            <div>
              <p style={{ margin: "0.25rem 0", color: "#555" }}>Plat Nomor Kendaraan:</p>
              <p style={{ margin: 0, fontWeight: "bold" }}>{transaction.plateNumber}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
              <th style={{ padding: "0.75rem", textAlign: "left", color: "#333" }}>Deskripsi Item (Sparepart/Jasa)</th>
              <th style={{ padding: "0.75rem", textAlign: "center", color: "#333" }}>Qty</th>
              <th style={{ padding: "0.75rem", textAlign: "right", color: "#333" }}>Harga Satuan</th>
              <th style={{ padding: "0.75rem", textAlign: "right", color: "#333" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((item: any) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.75rem" }}>
                  <div style={{ fontWeight: "600" }}>{item.itemType === "SPAREPART" ? item.sparepart?.name : item.service?.name}</div>
                  {item.itemType === "SPAREPART" && <div style={{ fontSize: "0.85rem", color: "#777" }}>PN: {item.sparepart?.partNumber}</div>}
                </td>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>{item.qty}</td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>Rp {(item.sellingPrice || 0).toLocaleString("id-ID")}</td>
                <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: "600" }}>Rp {(item.totalSelling || (item.qty * item.sellingPrice) || 0).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "300px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderTop: "2px solid #cbd5e1" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>TOTAL TAGIHAN:</span>
              <span style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#2563eb" }}>Rp {totalTagihan.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "4rem", textAlign: "center", color: "#777", fontSize: "0.9rem" }}>
          <p style={{ margin: "0.25rem 0" }}>Terima kasih telah mempercayakan kendaraan Anda kepada Bengkel Pro.</p>
          <p style={{ margin: "0" }}>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { visibility: hidden; background-color: white !important; }
          #invoice-content { visibility: visible; position: absolute; left: 0; top: 0; box-shadow: none; padding: 0; }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
}
