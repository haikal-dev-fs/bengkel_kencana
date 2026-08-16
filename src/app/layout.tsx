import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import AppLayout from "@/components/AppLayout";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Bengkel Pro | Sistem Manajemen Bengkel",
  description: "Aplikasi manajemen bengkel untuk mencatat sparepart, jasa servis, dan transaksi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuth = cookies().has("bengkel_auth");

  if (!isAuth) {
    return (
      <html lang="id">
        <body>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="id">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
