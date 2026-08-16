import { prisma } from "@/lib/prisma"

export default async function Dashboard() {
  // Fetch aggregate data
  const revenueResult = await prisma.transactionItem.aggregate({
    _sum: {
      totalSelling: true,
      profit: true
    }
  });

  const totalRevenue = revenueResult._sum.totalSelling || 0;
  const totalProfit = revenueResult._sum.profit || 0;

  // Fetch spareparts to check critical stock
  const allParts = await prisma.sparepart.findMany({
    orderBy: { currentStock: 'asc' }
  });
  
  const criticalParts = allParts.filter(p => p.currentStock <= p.minStock);

  return (
    <div>
      <h1>DASHBOARD UTAMA BENGKEL</h1>
      <p className="text-muted mb-4">Sistem Informasi Pergerakan Sparepart, Riwayat Servis & Keuntungan v2</p>

      <div className="grid grid-cols-3 mb-4">
        <div className="card" style={{ borderTop: "4px solid var(--accent)", textAlign: "center" }}>
          <h2 className="form-label" style={{ textTransform: "uppercase" }}>Total Pendapatan</h2>
          <div className="text-accent" style={{ fontSize: "2rem", fontWeight: "700" }}>
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--success)", textAlign: "center" }}>
          <h2 className="form-label" style={{ textTransform: "uppercase" }}>Total Keuntungan</h2>
          <div className="text-success" style={{ fontSize: "2rem", fontWeight: "700" }}>
            Rp {totalProfit.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--warning)", textAlign: "center" }}>
          <h2 className="form-label" style={{ textTransform: "uppercase" }}>Sparepart Harus Re-Stock</h2>
          <div className="text-warning" style={{ fontSize: "2rem", fontWeight: "700" }}>
            {criticalParts.length}
          </div>
        </div>
      </div>

      <h2 className="text-danger mt-4" style={{ fontSize: "1rem" }}>PERINGATAN SPAREPART CRITICAL (STOK MINIM)</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Nama Sparepart</th>
              <th>Stok Akhir</th>
              <th>Batas Minimum</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {criticalParts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted" style={{ textAlign: "center" }}>Semua Stok Aman</td>
              </tr>
            ) : (
              criticalParts.map(part => (
                <tr key={part.id}>
                  <td className="text-accent" style={{ fontWeight: "600" }}>{part.partNumber}</td>
                  <td>{part.name}</td>
                  <td className="text-danger" style={{ fontWeight: "700" }}>{part.currentStock}</td>
                  <td>{part.minStock}</td>
                  <td><span className="badge badge-danger">Kritis</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
