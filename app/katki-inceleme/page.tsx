import type { Metadata } from "next";
import Link from "next/link";
import AdminDesk from "./AdminDesk";
import {
  chatGPTSignOutPath,
} from "../chatgpt-auth";
import { requireContributionAdmin } from "../../lib/contribution-admin.server";
import "../admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editör Masası | Nefer Atlası",
  description: "Nefer Atlası saha katkılarını inceleme ve doğrulama yüzeyi.",
  robots: { index: false, follow: false },
};

export default async function ContributionReviewPage() {
  const admin = await requireContributionAdmin("/katki-inceleme");
  if (!admin) {
    return (
      <main className="adminDenied">
        <div>
          <b>NEFER ATLASI</b>
          <h1>Bu hesap editör değil</h1>
          <p>
            Yönetim ekranı yalnız açıkça yetkilendirilmiş site sahibine açıktır.
          </p>
          <a href={chatGPTSignOutPath("/katki-inceleme")}>
            Farklı hesapla giriş yap
          </a>
          <Link className="quiet" href="/">Ana siteye dön</Link>
        </div>
      </main>
    );
  }
  return (
    <AdminDesk
      adminName={admin.displayName}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}
