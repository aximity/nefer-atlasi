import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { requireContributionAdmin } from "../../lib/contribution-admin.server";
import FarmOperations from "./FarmOperations";
import "../farm-operations.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saha Operasyonu | Nefer Atlası",
  description: "KÖ maden farm turları, fiyat gözlemleri ve saatlik verim hesabı.",
  robots: { index: false, follow: false },
};

export default async function FarmOperationsPage() {
  const admin = await requireContributionAdmin("/farm-operasyonu");
  if (!admin) {
    return (
      <main className="adminDenied">
        <div>
          <b>NEFER ATLASI</b>
          <h1>Bu hesap saha editörü değil</h1>
          <p>Farm kayıtları yalnız yetkilendirilmiş site sahibine açıktır.</p>
          <a href={chatGPTSignOutPath("/farm-operasyonu")}>Farklı hesapla giriş yap</a>
          <Link className="quiet" href="/">Ana siteye dön</Link>
        </div>
      </main>
    );
  }
  return (
    <FarmOperations
      adminName={admin.displayName}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}
