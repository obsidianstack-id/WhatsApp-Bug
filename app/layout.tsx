import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WA Report Desk",
  description: "Dashboard untuk mendokumentasikan dugaan pelanggaran WhatsApp secara bertanggung jawab."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}