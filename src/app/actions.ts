"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { generateId } from "@/lib/generateId";

export async function unlockSystem(password: string) {
  const correctPassword = process.env.APP_PASSWORD || "bengkel123";
  if (password === correctPassword) {
    cookies().set("bengkel_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return { success: true };
  }
  return { success: false };
}

export async function lockSystem() {
  cookies().delete("bengkel_auth");
}

export async function createSparepart(formData: FormData) {
  const partNumber = formData.get("partNumber") as string;
  const name = formData.get("name") as string;
  const purchasePrice = parseInt(formData.get("purchasePrice") as string);
  const sellingPrice = parseInt(formData.get("sellingPrice") as string);
  const initialStock = parseInt(formData.get("initialStock") as string);
  const minStock = parseInt(formData.get("minStock") as string);

  const existing = await prisma.sparepart.findUnique({ where: { partNumber } });
  if (existing) {
    throw new Error("Gagal: Part Number sudah terdaftar! Gunakan Part Number yang berbeda.");
  }

  const id = await generateId("PART", "sparepart");

  await prisma.sparepart.create({
    data: {
      id,
      partNumber,
      name,
      purchasePrice,
      sellingPrice,
      initialStock,
      currentStock: initialStock, // on creation, current = initial
      minStock,
    },
  });

  revalidatePath("/sparepart");
  revalidatePath("/");
}

export async function updateSparepart(formData: FormData) {
  const id = formData.get("id") as string;
  const partNumber = formData.get("partNumber") as string;
  const name = formData.get("name") as string;
  const purchasePrice = parseInt(formData.get("purchasePrice") as string);
  const sellingPrice = parseInt(formData.get("sellingPrice") as string);
  const minStock = parseInt(formData.get("minStock") as string);

  // Check unique partNumber if changed
  const existing = await prisma.sparepart.findUnique({ where: { partNumber } });
  if (existing && existing.id !== id) {
    throw new Error("Gagal: Part Number sudah terdaftar untuk sparepart lain!");
  }

  await prisma.sparepart.update({
    where: { id },
    data: {
      partNumber,
      name,
      purchasePrice,
      sellingPrice,
      minStock,
    },
  });

  revalidatePath("/sparepart");
  revalidatePath("/");
}

export async function deleteSparepart(id: string) {
  await prisma.sparepart.delete({ where: { id } });
  revalidatePath("/sparepart");
  revalidatePath("/");
}

export async function createService(formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseInt(formData.get("price") as string);

  const id = await generateId("JASA", "service");

  await prisma.service.create({
    data: { id, name, price },
  });

  revalidatePath("/services");
}

export async function updateService(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const price = parseInt(formData.get("price") as string);

  await prisma.service.update({
    where: { id },
    data: { name, price },
  });

  revalidatePath("/services");
}

export async function deleteService(id: string) {
  await prisma.service.delete({ where: { id } });
  revalidatePath("/services");
}

export async function createPurchase(data: {
  invoiceNumber: string;
  supplier: string;
  date: Date;
  items: {
    sparepartId: string;
    qty: number;
    unitPrice: number;
  }[];
}) {
  await prisma.$transaction(async (tx) => {
    for (const item of data.items) {
      const id = await generateId("RESTOCK", "purchase", tx);
      const totalPrice = item.qty * item.unitPrice;
      
      // Buat log pembelian
      await tx.purchase.create({
        data: { 
          id, 
          invoiceNumber: data.invoiceNumber, 
          supplier: data.supplier, 
          date: data.date,
          sparepartId: item.sparepartId, 
          qty: item.qty, 
          unitPrice: item.unitPrice, 
          totalPrice 
        },
      });

      // Tambah stok akhir di master sparepart
      await tx.sparepart.update({
        where: { id: item.sparepartId },
        data: {
          currentStock: { increment: item.qty },
        },
      });
    }
  });

  revalidatePath("/purchases");
  revalidatePath("/sparepart");
  revalidatePath("/");
}

export async function createTransaction(data: {
  woNumber: string;
  plateNumber: string;
  customerName: string;
  items: {
    type: "SPAREPART" | "SERVICE";
    id: string;
    qty: number;
    price: number; // selling price
    cost: number; // purchase price for profit calculation
  }[];
}) {
  await prisma.$transaction(async (tx) => {
    // Generate WO id secara aman di server untuk mencegah duplikat jika form stale
    const id = await generateId("WO", "transaction", tx);
    
    // Buat transaksi
    const transaction = await tx.transaction.create({
      data: {
        id,
        woNumber: id,
        plateNumber: data.plateNumber,
        customerName: data.customerName,
      },
    });

    // Buat Items
    for (const item of data.items) {
      const totalSelling = item.price * item.qty;
      const totalPurchase = item.cost * item.qty;
      const profit = totalSelling - totalPurchase;

      const itemId = await generateId("ITEM", "transactionItem", tx);

      await tx.transactionItem.create({
        data: {
          id: itemId,
          transactionId: transaction.id,
          itemType: item.type,
          qty: item.qty,
          sellingPrice: item.price,
          totalSelling,
          purchasePrice: item.cost,
          totalPurchase,
          profit,
          sparepartId: item.type === "SPAREPART" ? item.id : null,
          serviceId: item.type === "SERVICE" ? item.id : null,
        },
      });

      // Kurangi stok jika itu sparepart
      if (item.type === "SPAREPART") {
        await tx.sparepart.update({
          where: { id: item.id },
          data: {
            currentStock: {
              decrement: item.qty,
            },
          },
        });
      }
    }
  });

  revalidatePath("/transactions");
  revalidatePath("/sparepart");
  revalidatePath("/reports");
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!transaction) throw new Error("Transaksi tidak ditemukan.");

  const isExpired = (new Date().getTime() - new Date(transaction.createdAt).getTime()) > 24 * 60 * 60 * 1000;
  if (isExpired) {
    throw new Error("Gagal: Transaksi sudah lebih dari 24 jam dan tidak dapat dihapus.");
  }

  await prisma.$transaction(async (tx) => {
    for (const item of transaction.items) {
      if (item.itemType === "SPAREPART" && item.sparepartId) {
        await tx.sparepart.update({
          where: { id: item.sparepartId },
          data: { currentStock: { increment: item.qty } },
        });
      }
    }

    await tx.transaction.delete({ where: { id } });
  });

  revalidatePath("/transactions");
  revalidatePath("/reports");
  revalidatePath("/sparepart");
  revalidatePath("/");
}

export async function updateTransaction(id: string, data: {
  plateNumber: string;
  customerName: string;
  items: {
    type: "SPAREPART" | "SERVICE";
    id: string;
    qty: number;
    price: number;
    cost: number;
  }[];
}) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!transaction) throw new Error("Transaksi tidak ditemukan.");

  const isExpired = (new Date().getTime() - new Date(transaction.createdAt).getTime()) > 24 * 60 * 60 * 1000;
  if (isExpired) {
    throw new Error("Gagal: Transaksi sudah lebih dari 24 jam dan tidak dapat diubah.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Restore old stock
    for (const oldItem of transaction.items) {
      if (oldItem.itemType === "SPAREPART" && oldItem.sparepartId) {
        await tx.sparepart.update({
          where: { id: oldItem.sparepartId },
          data: { currentStock: { increment: oldItem.qty } },
        });
      }
    }

    // 2. Delete old items
    await tx.transactionItem.deleteMany({
      where: { transactionId: id },
    });

    // 3. Update transaction basic info
    await tx.transaction.update({
      where: { id },
      data: {
        plateNumber: data.plateNumber,
        customerName: data.customerName,
      },
    });

    // 4. Create new items and deduct stock
    for (const item of data.items) {
      const totalSelling = item.price * item.qty;
      const totalPurchase = item.cost * item.qty;
      const profit = totalSelling - totalPurchase;
      const itemId = await generateId("ITEM", "transactionItem", tx);

      await tx.transactionItem.create({
        data: {
          id: itemId,
          transactionId: id,
          itemType: item.type,
          qty: item.qty,
          sellingPrice: item.price,
          totalSelling,
          purchasePrice: item.cost,
          totalPurchase,
          profit,
          sparepartId: item.type === "SPAREPART" ? item.id : null,
          serviceId: item.type === "SERVICE" ? item.id : null,
        },
      });

      if (item.type === "SPAREPART") {
        await tx.sparepart.update({
          where: { id: item.id },
          data: { currentStock: { decrement: item.qty } },
        });
      }
    }
  });

  revalidatePath("/transactions");
  revalidatePath("/reports");
  revalidatePath("/sparepart");
  revalidatePath("/");
}
