"use client";
import React, { useState, useMemo } from "react";
import { createPurchase } from "@/app/actions";
import CurrencyInput from "@/components/CurrencyInput";
import SearchableSelect from "@/components/SearchableSelect";
import Swal from "sweetalert2";

export default function PurchaseClient({ purchases, spareparts }: { purchases: any[], spareparts: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart State
  const [items, setItems] = useState<any[]>([]);
  const [selectedSparepartId, setSelectedSparepartId] = useState("");
  const [qty, setQty] = useState<number | string>(1);
  const [unitPrice, setUnitPrice] = useState("");

  const itemsPerPage = 10;

  // Handle Filtering
  const filtered = useMemo(() => {
    if (!search) return purchases;
    const lower = search.toLowerCase();
    return purchases.filter(
      (p) =>
        p.invoiceNumber.toLowerCase().includes(lower) ||
        p.supplier.toLowerCase().includes(lower) ||
        p.sparepart.name.toLowerCase().includes(lower)
    );
  }, [purchases, search]);

  // Handle Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      
      if (sortKey === "sparepart") {
        valA = a.sparepart.name;
        valB = b.sparepart.name;
      }
      if (sortKey === "date") {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
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

  const handleAddItem = () => {
    if (!selectedSparepartId) {
      Swal.fire("Peringatan", "Silakan pilih sparepart terlebih dahulu!", "warning");
      return;
    }
    
    const finalQty = parseInt(qty.toString()) || 1;

    if (finalQty <= 0) {
      Swal.fire("Peringatan", "Qty harus lebih dari 0!", "warning");
      return;
    }
    if (!unitPrice) {
      Swal.fire("Peringatan", "Silakan masukkan harga satuan!", "warning");
      return;
    }

    const part = spareparts.find(p => p.id === selectedSparepartId);
    if (!part) return;

    // Check if already exists in cart, if yes, just update qty
    const existing = items.find(i => i.sparepartId === selectedSparepartId);
    if (existing) {
      setItems(items.map(i => 
        i.sparepartId === selectedSparepartId 
          ? { ...i, qty: i.qty + finalQty, unitPrice: parseInt(unitPrice) }
          : i
      ));
    } else {
      setItems([...items, {
        sparepartId: part.id,
        partNumber: part.partNumber,
        name: part.name,
        qty: finalQty,
        unitPrice: parseInt(unitPrice)
      }]);
    }

    // Reset inputs
    setSelectedSparepartId("");
    setQty(1);
    setUnitPrice("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.sparepartId !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      Swal.fire("Peringatan", "Belum ada sparepart yang ditambahkan!", "warning");
      return;
    }

    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Parse date string (YYYY-MM-DD) into Date object
    const dateStr = formData.get("date") as string;
    let dateObj = new Date();
    if (dateStr) {
      dateObj = new Date(dateStr);
    }

    const payload = {
      invoiceNumber: formData.get("invoiceNumber") as string,
      supplier: formData.get("supplier") as string,
      date: dateObj,
      items: items.map(i => ({
        sparepartId: i.sparepartId,
        qty: i.qty,
        unitPrice: i.unitPrice
      }))
    };

    try {
      await createPurchase(payload);
      Swal.fire("Berhasil!", "Log pembelian berhasil ditambahkan dan stok diperbarui.", "success");
      setIsFormOpen(false);
      setItems([]);
      form.reset();
    } catch (err: any) {
      Swal.fire("Gagal!", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>LOG PEMBELIAN SPAREPART (RESTOCK)</h1>
        <button className="btn btn-primary" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? "Tutup Form" : "+ Catat Pembelian Baru"}
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: isFormOpen ? "1fr 2fr" : "1fr" }}>
        {isFormOpen && (
          <div className="card" style={{ height: "fit-content" }}>
            <h2>Catat Pembelian Baru</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              <div className="form-group">
                <label className="form-label">Tanggal Pembelian</label>
                <input type="date" name="date" className="form-input" required defaultValue={getTodayDateString()} />
              </div>

              <div className="form-group">
                <label className="form-label">No Faktur</label>
                <input type="text" name="invoiceNumber" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input type="text" name="supplier" className="form-input" required />
              </div>

              <div style={{ padding: "1rem", backgroundColor: "rgba(0,0,0,0.1)", borderRadius: "var(--radius-md)" }}>
                <h3 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Tambah Item Sparepart</h3>
                <div className="form-group mb-4">
                  <SearchableSelect 
                    value={selectedSparepartId}
                    onChange={(val) => setSelectedSparepartId(val)}
                    placeholder="Pilih Sparepart..."
                    options={spareparts.map(part => ({
                      value: part.id,
                      label: `[${part.partNumber}] ${part.name}`
                    }))} 
                  />
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="form-group w-full">
                    <label className="form-label">Qty Masuk</label>
                    <input type="number" className="form-input" value={qty} onChange={e => setQty(e.target.value)} min="1" />
                  </div>
                  <div className="form-group w-full">
                    <label className="form-label">Harga Satuan</label>
                    <CurrencyInput 
                      value={unitPrice}
                      onChange={(val) => setUnitPrice(val)} 
                      className="form-input" 
                    />
                  </div>
                </div>
                <button type="button" onClick={handleAddItem} className="btn btn-outline w-full" style={{ padding: "0.5rem" }}>
                  + Tambah ke List
                </button>
              </div>

              {items.length > 0 && (
                <div className="table-container" style={{ margin: "0" }}>
                  <table className="table" style={{ fontSize: "0.8rem" }}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                        <th>Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.sparepartId}>
                          <td style={{ whiteSpace: "normal" }}><b>{item.partNumber}</b><br/>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>Rp {(item.qty * item.unitPrice).toLocaleString("id-ID")}</td>
                          <td>
                            <button type="button" onClick={() => removeItem(item.sparepartId)} className="badge badge-danger" style={{ border: "none", cursor: "pointer" }}>X</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-accent" style={{ fontWeight: "700", textAlign: "right" }}>
                    Total: Rp {items.reduce((sum, i) => sum + (i.qty * i.unitPrice), 0).toLocaleString("id-ID")}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-success mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan & Tambah Stok"}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <div className="flex justify-between align-center mb-4">
            <h2>Riwayat Pembelian</h2>
            <input 
              type="text" 
              className="form-input" 
              placeholder="🔍 Cari faktur, supplier, sparepart..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "300px" }}
            />
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>Tanggal {sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("invoiceNumber")} style={{ cursor: "pointer" }}>No Faktur {sortKey === "invoiceNumber" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("supplier")} style={{ cursor: "pointer" }}>Supplier {sortKey === "supplier" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("sparepart")} style={{ cursor: "pointer" }}>Nama Sparepart {sortKey === "sparepart" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("qty")} style={{ cursor: "pointer" }}>Qty {sortKey === "qty" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                  <th onClick={() => handleSort("totalPrice")} style={{ cursor: "pointer" }}>Total Harga {sortKey === "totalPrice" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted" style={{ textAlign: "center" }}>Data tidak ditemukan</td>
                  </tr>
                ) : (
                  paginated.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="text-muted" style={{ fontSize: "0.875rem" }}>
                        {new Date(purchase.date).toLocaleDateString("id-ID")}
                      </td>
                      <td style={{ fontWeight: "500" }}>{purchase.invoiceNumber}</td>
                      <td>{purchase.supplier}</td>
                      <td className="text-accent">[{purchase.sparepart.partNumber}] {purchase.sparepart.name}</td>
                      <td style={{ fontWeight: "700" }}>{purchase.qty}</td>
                      <td>Rp {purchase.totalPrice.toLocaleString("id-ID")}</td>
                    </tr>
                  ))
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
