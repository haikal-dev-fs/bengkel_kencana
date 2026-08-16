"use client";
import { useState } from "react";
import { createTransaction } from "@/app/actions";
import SearchableSelect from "@/components/SearchableSelect";
import CurrencyInput from "@/components/CurrencyInput";
import Swal from "sweetalert2";

type ItemOption = {
  id: string;
  name: string;
  price: number;
  cost: number;
  type: "SPAREPART" | "SERVICE";
  stock?: number;
};

export default function TransactionForm({
  options,
  nextWoNumber,
}: {
  options: ItemOption[];
  nextWoNumber: string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [qty, setQty] = useState<number | string>(1);
  const [customPrice, setCustomPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    const option = options.find((o) => o.id === selectedItemId);
    if (!option) return;
    
    const finalQty = parseInt(qty.toString()) || 1;

    if (option.type === "SPAREPART" && option.stock !== undefined && finalQty > option.stock) {
      Swal.fire("Gagal", "Stok tidak mencukupi!", "error");
      return;
    }

    const priceToUse = customPrice ? parseInt(customPrice) : option.price;

    setItems([...items, { ...option, qty: finalQty, price: priceToUse }]);
    setSelectedItemId("");
    setQty(1);
    setCustomPrice("");
  };

  const handleItemSelect = (val: string) => {
    setSelectedItemId(val);
    const option = options.find((o) => o.id === val);
    if (option) {
      setCustomPrice(option.price.toString());
    } else {
      setCustomPrice("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      Swal.fire("Peringatan", "Tambahkan minimal 1 item!", "warning");
      return;
    }
    
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await createTransaction({
        woNumber: formData.get("woNumber") as string,
        plateNumber: formData.get("plateNumber") as string,
        customerName: formData.get("customerName") as string,
        items: items.map((i) => ({
          type: i.type,
          id: i.id,
          qty: i.qty,
          price: i.price,
          cost: i.cost,
        })),
      });
      Swal.fire("Berhasil!", "Transaksi berhasil disimpan!", "success");
      setItems([]);
      form.reset();
    } catch (error: any) {
      Swal.fire("Gagal!", error.message || "Terjadi kesalahan saat menyimpan transaksi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBelanja = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="flex gap-4">
        <div className="form-group w-full">
          <label className="form-label">No Work Order (WO)</label>
          <input 
            type="text" 
            name="woNumber" 
            className="form-input" 
            value={nextWoNumber} 
            readOnly 
            style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)", cursor: "not-allowed", fontWeight: "bold" }}
          />
        </div>
        <div className="form-group w-full">
          <label className="form-label">Plat Nomor</label>
          <input type="text" name="plateNumber" className="form-input" required />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Nama Pelanggan</label>
        <input type="text" name="customerName" className="form-input" required />
      </div>

      <div style={{ padding: "1rem", backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Tambah Item (Sparepart/Jasa)</h3>
        <div className="form-group w-full mb-4">
          <label className="form-label">Pilih Item (Sparepart / Jasa)</label>
          <SearchableSelect 
            value={selectedItemId}
            onChange={handleItemSelect}
            options={options.map(opt => ({
              value: opt.id,
              label: opt.name
            }))}
          />
        </div>
        <div className="flex gap-4 mb-4">
          <div className="form-group w-full" style={{ maxWidth: "120px" }}>
            <label className="form-label">Qty</label>
            <input
              type="number"
              className="form-input"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              min="1"
            />
          </div>
          <div className="form-group w-full">
            <label className="form-label">Harga Satuan</label>
            <CurrencyInput 
              value={customPrice}
              onChange={(val) => setCustomPrice(val)}
              className="form-input"
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary w-full" onClick={handleAddItem} style={{ padding: "0.75rem" }}>
          + Tambah ke Daftar
        </button>
      </div>

      {items.length > 0 && (
        <table className="table" style={{ backgroundColor: "var(--bg-card)" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-hover)" }}>
              <th>ITEM</th>
              <th>QTY</th>
              <th>HARGA</th>
              <th>SUBTOTAL</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ whiteSpace: "normal" }}>{item.name}</td>
                <td>{item.qty}</td>
                <td>Rp {item.price.toLocaleString("id-ID")}</td>
                <td>Rp {(item.price * item.qty).toLocaleString("id-ID")}</td>
                <td>
                  <button type="button" className="text-danger" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => handleRemoveItem(idx)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>Total Tagihan:</td>
              <td colSpan={2} style={{ fontWeight: "bold", color: "var(--accent)", fontSize: "1.2rem" }}>
                Rp {totalBelanja.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <button type="submit" className="btn btn-success mt-4" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
      </button>
    </form>
  );
}
