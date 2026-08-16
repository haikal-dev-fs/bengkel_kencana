import { prisma } from "@/lib/prisma";
import ReportClient from "./ReportClient";

export default async function ReportsPage() {
  const transactions = await prisma.transaction.findMany({
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const purchases = await prisma.purchase.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>LAPORAN KEUANGAN</h1>
      <ReportClient transactions={transactions} purchases={purchases} />
    </div>
  );
}
