import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoiceClient from "./InvoiceClient";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { sparepart: true, service: true },
      },
    },
  });

  if (!transaction) return notFound();

  const setting = await prisma.setting.findUnique({
    where: { id: 1 },
  });

  return <InvoiceClient transaction={transaction} setting={setting} />;
}
