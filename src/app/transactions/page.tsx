import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generateId";
import TransactionForm from "./TransactionForm";
import TransactionHistoryClient from "./TransactionHistoryClient";

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    include: {
      items: {
        include: {
          sparepart: true,
          service: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const nextWoNumber = await generateId("WO", "transaction");
  const spareparts = await prisma.sparepart.findMany({ orderBy: { name: "asc" } });
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  
  const options = [
    ...spareparts.map((p) => ({
      id: p.id,
      name: `[SPAREPART] ${p.partNumber} - ${p.name} (Stok: ${p.currentStock})`,
      price: p.sellingPrice,
      cost: p.purchasePrice,
      type: "SPAREPART" as const,
      stock: p.currentStock,
    })),
    ...services.map((s) => ({
      id: s.id,
      name: `[JASA] ${s.name}`,
      price: s.price,
      cost: 0,
      type: "SERVICE" as const,
    })),
  ];

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>TRANSAKSI & RIWAYAT SERVIS</h1>
      </div>

      <div className="grid grid-cols-3">
        <div className="card" style={{ gridColumn: "span 1", height: "fit-content" }}>
          <h2>Catat Transaksi Baru</h2>
          <TransactionForm options={options} nextWoNumber={nextWoNumber} />
        </div>

        <TransactionHistoryClient transactions={transactions} />
      </div>
    </div>
  );
}
