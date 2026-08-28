import type { Metadata } from "next";
import Link from "next/link";
import ProductionPlanner from "../farm-operasyonu/ProductionPlanner";
import "../farm-operations.css";

export const metadata: Metadata = {
  title: "Üretim Takibi | Nefer Atlası",
  description: "Eşya ve tılsım reçeteleri için cihazda kalan stok, favori, fotoğraf referansı ve eksik malzeme takibi.",
};

export default function PublicProductionPage() {
  return <main className="farmOps publicProduction">
    <header className="farmTopbar"><Link className="farmBrand" href="/"><i>N</i><span><b>NEFER ATLASI</b><small>ÜRETİM TAKİBİ</small></span></Link><div><Link href="/?module=recipes#recipes">Reçeteler</Link><Link href="/">Ana sayfa</Link></div></header>
    <section className="publicProductionIntro"><small>YALNIZ BU CİHAZDA</small><h1>Stok gir.<br/><em>En yakın üretimi gör.</em></h1><p>Favoriler, stoklar ve fotoğraf taslağı tarayıcında kalır. Fotoğraf otomatik tanınmaz; gördüğün malzeme ve adedi sen onaylarsın.</p></section>
    <ProductionPlanner />
  </main>;
}
