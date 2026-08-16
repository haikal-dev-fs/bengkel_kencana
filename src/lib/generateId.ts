import { prisma } from "@/lib/prisma";

export async function generateId(
  prefix: "PART" | "JASA" | "RESTOCK" | "TRX" | "ITEM" | "WO",
  modelName: "sparepart" | "service" | "purchase" | "transaction" | "transactionItem",
  tx?: any
) {
  const client = tx || prisma;
  const date = new Date();
  const ddmmyy = `${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getFullYear()).slice(-2)}`;
  const searchPrefix = `${prefix}${ddmmyy}`;

  const lastRecord = await client[modelName].findFirst({
    where: { id: { startsWith: searchPrefix } },
    orderBy: { id: "desc" },
  });

  let sequence = 1;
  if (lastRecord && lastRecord.id) {
    const lastSequence = parseInt(lastRecord.id.slice(-4));
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${searchPrefix}${String(sequence).padStart(4, "0")}`;
}
