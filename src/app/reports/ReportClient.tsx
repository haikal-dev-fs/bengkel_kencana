"use client";
import React, { useMemo } from "react";

type MonthlyData = {
  month: string;
  omzet: number;
  profit: number;
  restock: number;
};

export default function ReportClient({ transactions, purchases }: { transactions: any[], purchases: any[] }) {
  
  const { summary, monthly } = useMemo(() => {
    let totalOmzet = 0;
    let totalProfit = 0;
    let totalRestock = 0;

    const monthMap: Record<string, MonthlyData> = {};

    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleString("id-ID", { month: "long", year: "numeric" });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthLabel, omzet: 0, profit: 0, restock: 0 };
      }

      const txOmzet = tx.items.reduce((sum: number, item: any) => sum + (item.totalSelling || (item.qty * item.sellingPrice) || 0), 0);
      const txProfit = tx.items.reduce((sum: number, item: any) => sum + (item.profit || 0), 0);

      monthMap[monthKey].omzet += txOmzet;
      monthMap[monthKey].profit += txProfit;

      totalOmzet += txOmzet;
      totalProfit += txProfit;
    });

    purchases.forEach((p) => {
      const date = new Date(p.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleString("id-ID", { month: "long", year: "numeric" });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthLabel, omzet: 0, profit: 0, restock: 0 };
      }

      monthMap[monthKey].restock += p.totalPrice;
      totalRestock += p.totalPrice;
    });

    const monthlyArray = Object.keys(monthMap)
      .sort((a, b) => b.localeCompare(a)) // Sort descending by YYYY-MM
      .map(key => monthMap[key]);

    return {
      summary: { totalOmzet, totalProfit, totalRestock },
      monthly: monthlyArray
    };
  }, [transactions, purchases]);

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
        
        <div className="card" style={{ borderTop: "4px solid var(--primary)" }}>
          <h3 className="text-muted" style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", textTransform: "uppercase" }}>Total Omzet (Penjualan)</h3>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>
            Rp {summary.totalOmzet.toLocaleString("id-ID")}
          </div>
          <p className="text-muted" style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem" }}>Akumulasi pendapatan kotor</p>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--success)" }}>
          <h3 className="text-muted" style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", textTransform: "uppercase" }}>Total Laba Kotor (Keuntungan)</h3>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--success)" }}>
            Rp {summary.totalProfit.toLocaleString("id-ID")}
          </div>
          <p className="text-muted" style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem" }}>Omzet dikurangi HPP</p>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--danger)" }}>
          <h3 className="text-muted" style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", textTransform: "uppercase" }}>Total Pengeluaran Restock</h3>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--danger)" }}>
            Rp {summary.totalRestock.toLocaleString("id-ID")}
          </div>
          <p className="text-muted" style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem" }}>Akumulasi belanja sparepart</p>
        </div>

      </div>

      {/* Monthly Table */}
      <div className="card">
        <h2 style={{ marginBottom: "1.5rem" }}>Rincian Bulanan</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>BULAN</th>
                <th style={{ textAlign: "right" }}>OMZET (PENJUALAN)</th>
                <th style={{ textAlign: "right" }}>PENGELUARAN RESTOCK</th>
                <th style={{ textAlign: "right" }}>LABA KOTOR</th>
              </tr>
            </thead>
            <tbody>
              {monthly.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted" style={{ textAlign: "center", padding: "2rem" }}>
                    Belum ada data transaksi atau pembelian.
                  </td>
                </tr>
              ) : (
                monthly.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "600", fontSize: "1.1rem" }}>{row.month}</td>
                    <td style={{ textAlign: "right", color: "var(--primary)", fontWeight: "600" }}>
                      Rp {row.omzet.toLocaleString("id-ID")}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--danger)", fontWeight: "600" }}>
                      Rp {row.restock.toLocaleString("id-ID")}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--success)", fontWeight: "bold", fontSize: "1.1rem" }}>
                      Rp {row.profit.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
