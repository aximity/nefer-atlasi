import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Nefer Atlası · İKV Rehberi ve Donanım Planlayıcı",
  description:
    "Kaynaklandırılmış İKV eşyalarını, reçetelerini, tılsımlarını ve donanım planlarını Nefer Atlası'nda keşfet.",
  openGraph: {
    title: "Nefer Atlası",
    description:
      "Kaynaklandırılmış İKV verileriyle eşya keşfi ve donanım planlama.",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
