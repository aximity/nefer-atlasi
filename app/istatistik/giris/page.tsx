import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAnalyticsAdmin } from "../../../lib/analytics-auth.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetici Girişi | Nefer Atlası",
  description: "Nefer Atlası sahibine özel yönetici ve trafik paneli girişi.",
  robots: { index: false, follow: false },
};

export default async function AnalyticsLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAnalyticsAdmin()) redirect("/istatistik");
  const { error } = await searchParams;
  return (
    <main className="analyticsLogin">
      <section>
        <Link className="analyticsBrand" href="/"><b>N</b><span>NEFER ATLASI</span></Link>
        <small>SAHİBE ÖZEL</small>
        <h1>Yönetici Girişi</h1>
        <p>ChatGPT hesabı gerekmez. Yönetici erişim anahtarınla trafik ve kullanım istatistiklerini açabilirsin.</p>
        {error && <div className="analyticsError" role="alert">
          {error === "limit"
            ? "Çok fazla hatalı deneme yapıldı. 15 dakika sonra tekrar dene."
            : error === "server"
              ? "Giriş servisine şu anda ulaşılamadı. Kısa süre sonra tekrar dene."
              : "Erişim anahtarı doğru değil."}
        </div>}
        <form action="/api/analytics/session" method="post">
          <label>
            <span>Erişim anahtarı</span>
            <input name="password" type="password" autoComplete="current-password" required minLength={12} autoFocus />
          </label>
          <button type="submit">Yönetici panelini aç</button>
        </form>
        <Link className="analyticsBack" href="/">← Ana siteye dön</Link>
      </section>
    </main>
  );
}
