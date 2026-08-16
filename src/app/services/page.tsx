import { prisma } from "@/lib/prisma";
import ServiceClient from "./ServiceClient";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ServiceClient services={services} />;
}
