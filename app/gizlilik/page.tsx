import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik | Nefer Atlası",
  description: "Nefer Atlası trafik ölçümü ve reklam izinleri hakkında açıklama.",
};

export default function PrivacyPage() {
  return (
    <main className="privacyPage">
      <Link className="analyticsBrand" href="/"><b>N</b><span>NEFER ATLASI</span></Link>
      <small>GİZLİLİK VE ÖLÇÜM</small>
      <h1>Az veri, açık amaç.</h1>
      <p>Nefer Atlası; hangi içeriklerin işe yaradığını anlayabilmek için sayfa görüntüleme, anonim günlük ziyaretçi, cihaz türü ve yönlendiren alan adı bilgilerini toplulaştırılmış biçimde ölçer.</p>
      <section>
        <h2>Saklamadığımız bilgiler</h2>
        <p>Ham IP adresi, gerçek ad, telefon, e-posta, oyun hesabı veya sohbet içeriği trafik tablosuna yazılmaz. Günlük ziyaretçi sayısı, IP ve tarayıcı bilgisinin gizli bir anahtarla tek yönlü özetlenmesiyle hesaplanır; bu özet farklı günlerde aynı kişiyi takip etmek için kullanılmaz.</p>
      </section>
      <section>
        <h2>Reklamlar</h2>
        <p>Reklam sistemi şu an kapalıdır. İleride açılırsa zorunlu olmayan reklam teknolojileri yalnız ziyaretçinin açık izniyle çalışır. İzin verilmeden reklam komutu veya reklam çerezi başlatılmaz.</p>
      </section>
      <section>
        <h2>Kontrol</h2>
        <p>Tarayıcının “İzleme” isteği etkinse trafik kaydı gönderilmez. Reklam tercihi cihazda saklanır ve tarayıcı verileri temizlenerek sıfırlanabilir.</p>
      </section>
      <Link className="privacyBack" href="/">← Atlas’a dön</Link>
    </main>
  );
}
