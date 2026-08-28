import type { Metadata } from "next";
import AnalyticsTracker from "./AnalyticsTracker";
import AdvertisingConsent from "./AdvertisingConsent";
import NavigationEvents from "./NavigationEvents";
import "./globals.css";
import "./endgame.css";
import "./mining.css";
import "./skills.css";
import "./ability-simulator.css";
import "./project-scorecard.css";
import "./contribution.css";
import "./group-board.css";
import "./guild-logistics.css";
import "./connected-atlas.css";
import "./quest-atlas.css";
import "./issue-desk.css";
import "./economy-workshop.css";
import "./sustainability.css";
import "./readability.css";
import "./analytics.css";
import "./talisman-production.css";
import "./minimal-shell.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://ikv-esya-rehberi.gdyon.chatgpt.site"),
  title: "Nefer Atlası | KÖ Bilgi, Strateji ve Ekonomi Platformu",
  description:
    "Kıyametin Öncüleri eşyaları, buildleri, yetenekleri, bölgeleri, madenleri, pazarı ve endgame analizi için kaynaklı topluluk platformu.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Nefer Atlası",
    description:
      "Kıyametin Öncüleri bilgisini doğrula; donanımını, yeteneğini, farmını ve stratejini aynı atlas üzerinde planla.",
    siteName: "Nefer Atlası",
    locale: "tr_TR",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nefer Atlası",
    description:
      "KÖ bilgi, strateji ve ekonomi platformu: kaynaklı eşya, build, yetenek, bölge, maden ve endgame analizi.",
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
      <body>
        {children}
        <NavigationEvents />
        <AnalyticsTracker />
        <AdvertisingConsent />
      </body>
    </html>
  );
}
