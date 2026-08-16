"use client";
import React, { useState, useMemo } from "react";
import { createSparepart, updateSparepart, deleteSparepart } from "@/app/actions";
import CurrencyInput from "@/components/CurrencyInput";
import Swal from "sweetalert2";

export default function SparepartClient({ parts }: { parts: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const criticalParts = useMemo(() => {
    return parts.filter(p => p.currentStock <= p.minStock);
  }, [parts]);

  // Handle Filtering
  const filtered = useMemo(() => {
    if (!search) return parts;
    const lower = search.toLowerCase();
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.partNumber.toLowerCase().includes(lower)
    );
  }, [parts, search]);

  // Handle Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
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

  const handleEdit = (part: any) => {
    setEditData(part);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditData(null);
    setIsFormOpen(!isFormOpen);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (editData) {
        formData.append("id", editData.id);
        await updateSparepart(formData);
        Swal.fire("Berhasil!", "Data sparepart berhasil diperbarui.", "success");
      } else {
        await createSparepart(formData);
        Swal.fire("Berhasil!", "Sparepart baru berhasil ditambahkan.", "success");
      }
      setIsFormOpen(false);
      setEditData(null);
    } catch (err: any) {
      Swal.fire("Gagal!", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data sparepart ini tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await deleteSparepart(id);
        Swal.fire("Terhapus!", "Data sparepart berhasil dihapus.", "success");
      } catch (err: any) {
        Swal.fire("Gagal!", err.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const showCriticalList = () => {
    const htmlList = criticalParts.map(p => `<li style="margin-bottom: 8px;"><b>[${p.partNumber}]</b> ${p.name} <br/><span style="color: #ef4444; font-weight: bold;">Sisa Stok: ${p.currentStock}</span> (Min: ${p.minStock})</li>`).join('');
    Swal.fire({
      title: "Daftar Sparepart Kritis",
      html: `<ul style="text-align: left; font-size: 0.9rem; max-height: 300px; overflow-y: auto;">${htmlList}</ul>`,
      icon: "warning",
      confirmButtonText: "Tutup",
      confirmButtonColor: "#3b82f6"
    });
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>MASTER DATA SPAREPART</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          {isFormOpen ? "Tutup Form" : "+ Tambah Data"}
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: isFormOpen ? "1fr 2fr" : "1fr" }}>
        {/* Form Container */}
        {isFormOpen && (
          <div className="card" style={{ height: "fit-content" }}>
            <h2>{editData ? "Edit Sparepart" : "Tambah Sparepart Baru"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Part Number</label>
                <input type="text" name="partNumber" className="form-input" required defaultValue={editData?.partNumber || ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Sparepart</label>
                <input type="text" name="name" className="form-input" required defaultValue={editData?.name || ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Beli (Rp)</label>
                <CurrencyInput key={`beli-${editData?.id}`} name="purchasePrice" className="form-input" required defaultValue={editData?.purchasePrice} />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Jual (Rp)</label>
                <CurrencyInput key={`jual-${editData?.id}`} name="sellingPrice" className="form-input" required defaultValue={editData?.sellingPrice} />
              </div>
              {!editData && (
                <div className="form-group">
                  <label className="form-label">Stok Awal</label>
                  <input type="number" name="initialStock" className="form-input" required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Batas Minimum Stok</label>
                <input type="number" name="minStock" className="form-input" required defaultValue={editData?.minStock || 0} />
              </div>
              <button type="submit" className="btn btn-success mt-4" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : (editData ? "Simpan Perubahan" : "Simpan Sparepart")}
              </button>
            </form>
          </div>
        )}

        {/* Table Container */}
        <div className="card">
          <div className="flex justify-between align-center mb-4">
            <h2>Daftar Sparepart</h2>
            <input 
              type="text" 
              className="form-input" 
              placeholder="🔍 Cari part number atau nama..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "300px" }}
            />
          </div>

          {criticalParts.length > 0 && (
            <div 
              onClick={showCriticalList}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--danger)",
                color: "var(--danger)",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                marginBottom: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: "600",
                fontSize: "0.9rem"
              }}
            >
              <span>⚠️ Peringatan: Ada {criticalParts.length} sparepart yang stoknya di bawah batas minimum!</span>
              <span style={{ textDecoration: "underline", fontSize: "0.8rem" }}>Lihat Detail</span>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("partNumber")} style={{ cursor: "pointer" }}>Part No. {sortKey === "partNumber" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>Nama {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("purchasePrice")} style={{ cursor: "pointer" }}>Harga Beli {sortKey === "purchasePrice" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("sellingPrice")} style={{ cursor: "pointer" }}>Harga Jual {sortKey === "sellingPrice" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("currentStock")} style={{ cursor: "pointer" }}>Stok Akhir {sortKey === "currentStock" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-muted" style={{ textAlign: "center" }}>Data tidak ditemukan</td>
                  </tr>
                ) : (
                  paginated.map((part) => (
                    <tr key={part.id}>
                      <td className="text-accent" style={{ fontWeight: "600", fontSize: "0.875rem" }}>{part.partNumber}</td>
                      <td style={{ fontWeight: "500" }}>{part.name}</td>
                      <td>Rp {part.purchasePrice.toLocaleString("id-ID")}</td>
                      <td>Rp {part.sellingPrice.toLocaleString("id-ID")}</td>
                      <td style={{ fontWeight: "600" }}>{part.currentStock}</td>
                      <td>
                        {part.currentStock <= part.minStock ? (
                          <span className="badge badge-danger">Kritis</span>
                        ) : (
                          <span className="badge badge-success">Aman</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(part)} className="badge badge-accent" style={{ border: "none", cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDelete(part.id)} className="badge badge-danger" style={{ border: "none", cursor: "pointer" }}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between align-center mt-4">
              <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                Menampilkan {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, sorted.length)} dari {sorted.length}
              </span>
              <div className="flex gap-2">
                <button 
                  className="btn btn-outline" 
                  disabled={page === 1} 
                  onClick={() => setPage(page - 1)}
                  style={{ padding: "0.25rem 0.75rem" }}
                >
                  Prev
                </button>
                <button 
                  className="btn btn-outline" 
                  disabled={page === totalPages} 
                  onClick={() => setPage(page + 1)}
                  style={{ padding: "0.25rem 0.75rem" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
