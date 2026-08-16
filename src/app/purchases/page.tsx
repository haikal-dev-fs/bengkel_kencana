import { prisma } from "@/lib/prisma";
import PurchaseClient from "./PurchaseClient";

export default async function PurchasesPage() {
  const purchases = await prisma.purchase.findMany({
    include: { sparepart: true },
    orderBy: { createdAt: "desc" },
  });

  const spareparts = await prisma.sparepart.findMany({
    orderBy: { name: "asc" },
  });

  return <PurchaseClient purchases={purchases} spareparts={spareparts} />;
}
