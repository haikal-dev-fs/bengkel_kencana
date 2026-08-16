"use client";
import React, { useState, useMemo } from "react";
import { createService, updateService, deleteService } from "@/app/actions";
import CurrencyInput from "@/components/CurrencyInput";
import Swal from "sweetalert2";

export default function ServiceClient({ services }: { services: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Handle Filtering
  const filtered = useMemo(() => {
    if (!search) return services;
    const lower = search.toLowerCase();
    return services.filter((s) => s.name.toLowerCase().includes(lower));
  }, [services, search]);

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

  const handleEdit = (service: any) => {
    setEditData(service);
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
        await updateService(formData);
        Swal.fire("Berhasil!", "Jasa servis berhasil diperbarui.", "success");
      } else {
        await createService(formData);
        Swal.fire("Berhasil!", "Jasa servis baru berhasil ditambahkan.", "success");
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
      text: "Data jasa ini tidak dapat dikembalikan!",
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
        await deleteService(id);
        Swal.fire("Terhapus!", "Data jasa berhasil dihapus.", "success");
      } catch (err: any) {
        Swal.fire("Gagal!", err.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>MASTER DATA JASA SERVIS</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          {isFormOpen ? "Tutup Form" : "+ Tambah Jasa"}
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: isFormOpen ? "1fr 2fr" : "1fr" }}>
        {/* Form Container */}
        {isFormOpen && (
          <div className="card" style={{ height: "fit-content" }}>
            <h2>{editData ? "Edit Jasa" : "Tambah Jasa Baru"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nama Jasa Servis</label>
                <input type="text" name="name" className="form-input" required defaultValue={editData?.name || ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Tarif / Harga Jual (Rp)</label>
                <CurrencyInput key={`price-${editData?.id}`} name="price" className="form-input" required defaultValue={editData?.price} />
              </div>
              <button type="submit" className="btn btn-success mt-4" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : (editData ? "Simpan Perubahan" : "Simpan Jasa")}
              </button>
            </form>
          </div>
        )}

        {/* Table Container */}
        <div className="card">
          <div className="flex justify-between align-center mb-4">
            <h2>Daftar Jasa Servis</h2>
            <input 
              type="text" 
              className="form-input" 
              placeholder="🔍 Cari nama jasa..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "300px" }}
            />
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>Nama Jasa {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("price")} style={{ cursor: "pointer" }}>Tarif (Rp) {sortKey === "price" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-muted" style={{ textAlign: "center" }}>Data tidak ditemukan</td>
                  </tr>
                ) : (
                  paginated.map((service) => (
                    <tr key={service.id}>
                      <td style={{ fontWeight: "500" }}>{service.name}</td>
                      <td>Rp {service.price.toLocaleString("id-ID")}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(service)} className="badge badge-accent" style={{ border: "none", cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDelete(service.id)} className="badge badge-danger" style={{ border: "none", cursor: "pointer" }}>Hapus</button>
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
