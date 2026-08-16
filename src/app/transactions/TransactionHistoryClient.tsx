"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";

export default function TransactionHistoryClient({ transactions }: { transactions: any[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Handle Filtering
  const filtered = useMemo(() => {
    if (!search) return transactions;
    const lower = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.woNumber.toLowerCase().includes(lower) ||
        t.plateNumber.toLowerCase().includes(lower) ||
        t.customerName.toLowerCase().includes(lower)
    );
  }, [transactions, search]);

  // Handle Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      
      if (sortKey === "date") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  // Handle Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, page]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="card" style={{ gridColumn: "span 2" }}>
      <div className="flex justify-between align-center mb-4">
        <h2>Riwayat Transaksi</h2>
        <input 
          type="text" 
          className="form-input" 
          placeholder="🔍 Cari WO, Plat, Pelanggan..." 
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ width: "300px" }}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort("woNumber")} style={{ cursor: "pointer" }}>NO WO {sortKey === "woNumber" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
              <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>TANGGAL {sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
              <th onClick={() => handleSort("plateNumber")} style={{ cursor: "pointer" }}>PLAT / PELANGGAN {sortKey === "plateNumber" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
              <th>ITEM TERJUAL</th>
              <th onClick={() => handleSort("totalSelling")} style={{ cursor: "pointer" }}>TOTAL BELANJA {sortKey === "totalSelling" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
              <th onClick={() => handleSort("profit")} style={{ cursor: "pointer" }}>KEUNTUNGAN {sortKey === "profit" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
              <th>CETAK NOTA</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted" style={{ textAlign: "center" }}>Belum ada riwayat transaksi</td>
              </tr>
            ) : (
              paginated.map((tx) => {
                const totalJual = tx.items.reduce((sum: number, item: any) => sum + (item.totalSelling || (item.qty * item.sellingPrice) || 0), 0);
                const totalProfit = tx.items.reduce((sum: number, item: any) => sum + (item.profit || 0), 0);
                
                return (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: "bold", color: "var(--primary)" }}>{tx.woNumber}</td>
                  <td className="text-muted" style={{ fontSize: "0.875rem" }}>
                    {new Date(tx.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td>
                    <div style={{ fontWeight: "600" }}>{tx.plateNumber}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>{tx.customerName}</div>
                  </td>
                  <td style={{ fontSize: "0.75rem" }}>
                    <ul style={{ paddingLeft: "1.2rem", margin: 0, listStyleType: "disc" }}>
                      {tx.items.map((i: any) => (
                        <li key={i.id} style={{ marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                          <span style={{ fontWeight: "600" }}>{i.qty}x</span> {i.itemType === "SPAREPART" ? i.sparepart?.name : i.service?.name}
                          <br/>
                          <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                            @ Rp {i.sellingPrice?.toLocaleString("id-ID") || 0} = Rp {((i.qty * i.sellingPrice) || 0).toLocaleString("id-ID")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ fontWeight: "bold" }}>Rp {totalJual.toLocaleString("id-ID")}</td>
                  <td style={{ color: "var(--success)" }}>Rp {totalProfit.toLocaleString("id-ID")}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <Link href={`/transactions/${tx.id}/invoice?action=print`} target="_blank" className="btn btn-primary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", textAlign: "center" }}>
                        🖨️ Print
                      </Link>
                      <Link href={`/transactions/${tx.id}/invoice?action=pdf`} target="_blank" className="btn btn-success" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", textAlign: "center", backgroundColor: "#dc2626", borderColor: "#dc2626" }}>
                        📄 PDF
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between align-center mt-4">
          <span className="text-muted" style={{ fontSize: "0.875rem" }}>
            Menampilkan {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, sorted.length)} dari {sorted.length}
          </span>
          <div className="flex gap-2">
            <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: "0.25rem 0.75rem" }}>Prev</button>
            <button className="btn btn-outline" disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ padding: "0.25rem 0.75rem" }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
