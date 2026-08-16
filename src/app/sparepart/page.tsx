import { prisma } from "@/lib/prisma";
import SparepartClient from "./SparepartClient";

export default async function SparepartPage() {
  const parts = await prisma.sparepart.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <SparepartClient parts={parts} />;
}
