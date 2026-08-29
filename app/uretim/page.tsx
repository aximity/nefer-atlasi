import type { Metadata } from "next";
import Link from "next/link";
import ProductionPlanner from "../farm-operasyonu/ProductionPlanner";
import "../farm-operations.css";

export const metadata: Metadata = {
  title: "Üretim Takibi | Nefer Atlası",
  description: "Eşya, tılsım ve iksir reçeteleri için fotoğraftan otomatik stok taslağı, onay ve eksik malzeme takibi.",
};

export default function PublicProductionPage() {
  return <main className="farmOps publicProduction">
    <header className="farmTopbar"><Link className="farmBrand" href="/"><i>N</i><span><b>NEFER ATLASI</b><small>ÜRETİM TAKİBİ</small></span></Link><div><Link href="/?module=recipes#recipes">Reçeteler</Link><Link href="/">Ana sayfa</Link></div></header>
    <section className="publicProductionIntro"><small>YALNIZ BU CİHAZDA</small><h1>Çantayı okut.<br/><em>En yakın üretimi gör.</em></h1><p>Fotoğraf cihazında analiz edilir; tanınan ikon ve adetler önce onay ekranına gelir. Stok yalnız sen onayladıktan sonra değişir.</p></section>
    <ProductionPlanner />
  </main>;
}
