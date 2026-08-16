import { prisma } from "@/lib/prisma";
import { updateSetting } from "@/app/actions";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const setting = await prisma.setting.findUnique({
    where: { id: 1 },
  });

  async function handleSave(formData: FormData) {
    "use server";
    await updateSetting({
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
    });
    redirect("/settings?success=1");
  }

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Pengaturan Identitas Bengkel</h2>
      <p className="text-muted mb-4">Informasi ini akan dicetak pada nota/kwitansi (Print & PDF).</p>
      
      <form action={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label">Nama Bengkel</label>
          <input 
            type="text" 
            name="name" 
            className="form-input" 
            defaultValue={setting?.name || "BENGKEL PRO"} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Alamat Lengkap</label>
          <textarea 
            name="address" 
            className="form-input" 
            rows={3} 
            defaultValue={setting?.address || "Alamat Bengkel Belum Diatur"} 
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nomor Telepon / WhatsApp</label>
          <input 
            type="text" 
            name="phone" 
            className="form-input" 
            defaultValue={setting?.phone || "08123456789"} 
            required 
          />
        </div>

        <button type="submit" className="btn btn-primary mt-4">
          Simpan Pengaturan
        </button>
      </form>
    </div>
  );
}
