import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import TransactionForm from "../../TransactionForm";
import Link from "next/link";

export default async function EditTransactionPage({ params }: { params: { id: string } }) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          sparepart: true,
          service: true,
        }
      }
    }
  });

  if (!transaction) return notFound();

  // Check 24 hours rule
  const isExpired = (new Date().getTime() - new Date(transaction.createdAt).getTime()) > 24 * 60 * 60 * 1000;
  if (isExpired) {
    redirect("/transactions");
  }

  // Fetch options
  const spareparts = await prisma.sparepart.findMany({
    orderBy: { name: "asc" },
  });

  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
  });

  const options = [
    ...spareparts.map((p) => ({
      id: p.id,
      name: `[Part] ${p.name} (Stok: ${p.currentStock})`,
      price: p.sellingPrice,
      cost: p.purchasePrice,
      type: "SPAREPART" as const,
      stock: p.currentStock,
    })),
    ...services.map((s) => ({
      id: s.id,
      name: `[Jasa] ${s.name}`,
      price: s.price,
      cost: 0,
      type: "SERVICE" as const,
    })),
  ];

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="flex justify-between align-center mb-4">
        <h2 style={{ margin: 0 }}>Edit Transaksi: {transaction.woNumber}</h2>
        <Link href="/transactions" className="btn btn-outline" style={{ padding: "0.5rem 1rem" }}>
          Batal
        </Link>
      </div>
      <TransactionForm options={options} nextWoNumber={transaction.woNumber} initialData={transaction} />
    </div>
  );
}
