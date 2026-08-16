import { prisma } from "./src/lib/prisma";
import { createTransaction } from "./src/app/actions";

async function main() {
  try {
    const service = await prisma.service.findFirst();
    if (!service) {
      console.log("No service found");
      return;
    }

    await createTransaction({
      woNumber: "WO1608260003",
      plateNumber: "B 1234 ABC",
      customerName: "Test",
      items: [
        {
          type: "SERVICE",
          id: service.id,
          qty: 1,
          price: 15000,
          cost: 0
        }
      ]
    });
    console.log("SUCCESS");
  } catch (e: any) {
    console.error("ERROR CAUGHT:");
    console.error(e.message);
  }
}

main();
