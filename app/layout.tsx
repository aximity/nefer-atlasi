import type { Metadata } from "next";
import "./globals.css";
import "./endgame.css";
import "./mining.css";
import "./skills.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://ikv-esya-rehberi.gdyon.chatgpt.site"),
  title: "İKV Eşya Rehberi ve Donanım Planlayıcı",
  description:
    "Alan bazlı kanıtlara dayanan İKV eşya arşivi ve sekiz yuvalı donanım planlayıcı.",
  openGraph: {
    title: "İKV Eşya Rehberi",
    description: "Eşyanı kanıtla, donanımını güvenilir verilerle planla.",
    images: ["/og.png"],
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
