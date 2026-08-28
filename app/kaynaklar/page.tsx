import type { Metadata } from "next";
import Link from "next/link";
import {
  appearanceImages,
  evidence,
  recipes,
  sources,
  talismans,
  type Source,
} from "../../lib/catalog";
import { potionRecipeSourceId } from "../../lib/potion-recipes";
import { talismanRecipes } from "../../lib/talisman-recipes";
import { SITE_RELEASE } from "../../lib/site-release";
import "../source-directory.css";

export const metadata: Metadata = {
  title: "Kaynaklar | Nefer Atlası",
  description: "Nefer Atlası'ndaki eşya, tılsım, iksir, malzeme, görev ve oyun içi kanıtların kategori bazlı kaynak dizini.",
};

const unique = (values: (string | undefined)[]) => [...new Set(values.filter((value): value is string => Boolean(value)))];

const sourceGroups = [
  {
    id: "esyalar",
    title: "Eşyalar ve eşya reçeteleri",
    use: "Eşya adı, sınıfı, yuvası, bölge/boss bilgisi, üretim reçetesi ve set görünüş referansları.",
    sourceIds: unique([
      ...evidence.map((row) => row.sourceId),
      ...recipes.map((row) => row.sourceId),
      ...appearanceImages.map((row) => row.sourceId),
    ]),
  },
  {
    id: "tilsimlar",
    title: "Tılsımlar ve tılsım reçeteleri",
    use: "Sınıf, renk, kademe, etki metni, üretim malzemeleri ve normal İKV edinme bağlamı.",
    sourceIds: unique([
      ...talismans.flatMap((row) => [row.sourceId, ...(row.verificationSourceIds ?? [])]),
      ...talismanRecipes.map((row) => row.sourceId),
      "official-ikv-gonul-vendor",
    ]),
  },
  {
    id: "iksirler",
    title: "İksirler",
    use: "İksir adları, seviyeleri, türleri, gerekli malzemeler ve adetler.",
    sourceIds: [potionRecipeSourceId],
  },
  {
    id: "malzemeler",
    title: "Madenler, materyaller ve meslekler",
    use: "Malzeme adları, Wiki ikonları, toplayıcı/üretici meslek ilişkileri ve ara üretim girdileri.",
    sourceIds: ["fandom-materials-20260828", "fandom-professions-20260826"],
  },
  {
    id: "gorevler",
    title: "Görevler",
    use: "Görev zincirleri, görev kısıtlamaları, NPC, konum, seviye ve açıklamalı görev sırası.",
    sourceIds: ["fandom-quest-chains-20260826", "fandom-explained-quests-20260826"],
  },
  {
    id: "oyun-ici-kanit",
    title: "Yetenekler ve oyun içi kanıtlar",
    use: "Yetenek adları, KÖ varyantları ve oyun içinde görülen etki/değer metinleri.",
    sourceIds: sources.filter((source) => source.type === "player_screenshot").map((source) => source.id),
  },
] as const;

const sourceTypeLabel = (source: Source) => {
  if (source.type === "fandom") return "İKV Wiki";
  if (source.type === "player_screenshot") return "Oyun içi görüntü";
  if (source.type === "official") return "Resmî kaynak";
  if (source.type.includes("server")) return "KÖ sunucu kaynağı";
  return "Topluluk kaynağı";
};

export default function SourcesPage() {
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  return <main className="sourceDirectory">
    <header className="sourceDirectoryTop"><Link href="/" className="sourceBrand"><i>N</i><span><b>NEFER ATLASI</b><small>KAYNAK DİZİNİ</small></span></Link><nav><Link href="/?module=recipes#recipes">Reçeteler</Link><Link href="/uretim">Üretim</Link></nav></header>

    <section className="sourceDirectoryIntro">
      <small>KAYNAKLAR</small>
      <h1>Neyi, nereden aldık?</h1>
      <p>Reçete ve bilgi sayfaları Nefer Atlası içinde açılır. İKV Wiki ve diğer kanıt bağlantıları yalnız burada, kullandığımız bilgi türüne göre ayrılır.</p>
      <div><span><b>{sourceGroups.length}</b><small>kategori</small></span><span><b>{sourceGroups.reduce((total, group) => total + group.sourceIds.length, 0)}</b><small>kaynak bağı</small></span><span><b>Sabit</b><small>reçete verisi</small></span></div>
    </section>

    <section className="sourceGroupList" aria-label="Kategori bazlı kaynaklar">
      {sourceGroups.map((group) => {
        const rows = group.sourceIds.map((id) => sourceById.get(id)).filter((row): row is Source => Boolean(row));
        return <details id={group.id} className="sourceGroup" key={group.id}>
          <summary><span><small>BU KAYNAKLARDAN ALINAN</small><b>{group.title}</b><em>{group.use}</em></span><strong>{rows.length} kaynak <i>+</i></strong></summary>
          <div>{rows.map((source) => {
            const external = source.url.startsWith("http");
            return <article key={source.id}><span><small>{sourceTypeLabel(source)} · {source.accessedAt}</small><b>{source.title}</b></span><a href={source.url} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>Kaynağı aç {external ? "↗" : "→"}</a></article>;
          })}</div>
        </details>;
      })}
    </section>

    <aside className="sourcePolicy"><small>KULLANIM KURALI</small><h2>Wiki, oyun bilgisi için birincil referans.</h2><p>İKV Wiki’de bulunan eşya, reçete, iksir, tılsım ve materyal bilgileri site içindeki kayda aktarılır. Pazar fiyatı, KÖ sunucusuna özgü oyuncu bildirimi ve güncel topluluk verisi ise Wiki bilgisiyle karıştırılmaz.</p></aside>

    <footer><span>Nefer Atlası · {SITE_RELEASE.channel} v{SITE_RELEASE.version}</span><Link href="/">Ana sayfaya dön →</Link></footer>
  </main>;
}
