"use client";

import ReleaseCenter from "./ReleaseCenter";
import { moduleTabs, quickModuleIds, type MainModule } from "./site-modules";
import { SITE_RELEASE } from "../lib/site-release";

type HomeGatewayProps = {
  onOpenSearch: () => void;
  onOpenModule: (id: MainModule) => void;
  onOpenMenu: () => void;
};

export function HomeGateway({ onOpenSearch, onOpenModule, onOpenMenu }: HomeGatewayProps) {
  return (
        <section className="homeGateway" id="top">
          <div><small>KÖ BİLGİ PLATFORMU</small><h1>Ne arıyorsun?</h1><p>Önce bilgiyi seç. Ayrıntılar yalnız açtığında görünür.</p></div>
          <button className="gatewaySearch" type="button" onClick={onOpenSearch}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/></svg><span><b>Atlas’ta ara</b><small>Eşya, tılsım, reçete, görev, maden veya boss</small></span><kbd>/</kbd></button>
          <nav className="gatewayChoices" id="modules" aria-label="Hızlı bölümler">{quickModuleIds.map((id) => { const item = moduleTabs.find((row) => row.id === id)!; return <button type="button" onClick={() => onOpenModule(id)} key={id}><span><b>{item.label}</b><small>{item.summary}</small></span><i>→</i></button>; })}</nav>
          <button className="gatewayMore" type="button" onClick={onOpenMenu}>Diğer araçları ve proje bölümlerini aç</button>
        </section>
  );
}

type ModuleContextProps = {
  activeModule: MainModule;
  onGoHome: () => void;
  onOpenMenu: () => void;
};

export function ModuleContext({ activeModule, onGoHome, onOpenMenu }: ModuleContextProps) {
  return <nav className="moduleContext" id="modules" aria-label="Açık bölüm"><button type="button" onClick={onGoHome}>← Ana sayfa</button><b>{moduleTabs.find((item) => item.id === activeModule)?.label}</b><button type="button" onClick={onOpenMenu}>Diğer bölümler</button></nav>;
}

export function SiteFooter() {
  return (
      <footer className="siteFooter">
        <div>
          <b>NEFER ATLASI</b>
          <span>{SITE_RELEASE.channel} v{SITE_RELEASE.version} · {SITE_RELEASE.releasedAt}</span>
          <span>Bağımsız Kıyametin Öncüleri topluluk projesi · resmî değildir.</span>
        </div>
        <p>Kaynak yoksa kesin bilgi yok. Ayrıntı ve doğrulama, yalnız ilgili kaydı açtığında gösterilir.</p>
        <details className="footerDetails"><summary>Bağlantılar ve yönetim <i>+</i></summary><div className="footerTools"><a href="https://kiyametoyun.net/" target="_blank" rel="noreferrer">Güncel Oyun Portalı</a><a href="/uretim">Üretim Takibi</a><a href="/kaynaklar">Kaynaklar</a><a href="/rehber">Kullanım Rehberi</a><a href="/gizlilik">Gizlilik</a><a href="/farm-operasyonu">Editör: Saha Operasyonu</a><a href="/katki-inceleme">Editör Masası</a><a href="/istatistik/giris">Yönetici Girişi</a><ReleaseCenter inline /></div></details>
      </footer>
  );
}
