"use client";
import { useMemo, useState } from "react";

type Item={id:number;name:string;family:string;className:"Savaşçı"|"Büyücü"|"Şifacı";type:string;icon:string;color:string;ench:string[]};
const data:Item[]=[
{id:1,name:"49. Seviye Balyoz — Hasar",family:"49. Seviye Balyoz",className:"Savaşçı",type:"Balyoz",icon:"◆",color:"ember",ench:["Maksimum hasar","Kritik vuruş"]},
{id:2,name:"49. Seviye Balyoz — Savunma",family:"49. Seviye Balyoz",className:"Savaşçı",type:"Balyoz",icon:"◆",color:"ember",ench:["Savunma","Dayanıklılık"]},
{id:3,name:"Savaşçı Zırhı — Örnek",family:"49. Seviye Savaşçı Zırhı",className:"Savaşçı",type:"Zırh",icon:"⬟",color:"ember",ench:["Zırh","Direnç"]},
{id:4,name:"Büyücü Asâsı — Ateş",family:"49. Seviye Asâ",className:"Büyücü",type:"Asâ",icon:"✦",color:"violet",ench:["Ateş hasarı","Enerji"]},
{id:5,name:"Büyücü Asâsı — Buz",family:"49. Seviye Asâ",className:"Büyücü",type:"Asâ",icon:"✦",color:"violet",ench:["Buz hasarı","Kritik büyü"]},
{id:6,name:"Büyücü Cübbesi — Örnek",family:"49. Seviye Büyücü Cübbesi",className:"Büyücü",type:"Cübbe",icon:"◈",color:"violet",ench:["Enerji","Büyü direnci"]},
{id:7,name:"Şifacı Hançeri — Zehir",family:"49. Seviye Hançer",className:"Şifacı",type:"Hançer",icon:"◇",color:"teal",ench:["Zehir hasarı","Kritik vuruş"]},
{id:8,name:"Şifacı Hançeri — İyileştirme",family:"49. Seviye Hançer",className:"Şifacı",type:"Hançer",icon:"◇",color:"teal",ench:["İyileştirme","Enerji"]},
{id:9,name:"Şifacı Ceketi — Örnek",family:"49. Seviye Şifacı Ceketi",className:"Şifacı",type:"Zırh",icon:"⬢",color:"teal",ench:["İyileştirme","Direnç"]}];
const filters=["Tümü","Savaşçı","Büyücü","Şifacı"] as const;

export default function Home(){
 const [query,setQuery]=useState("");const [filter,setFilter]=useState<(typeof filters)[number]>("Tümü");const [selected,setSelected]=useState<Item|null>(null);
 const shown=useMemo(()=>{const q=query.toLocaleLowerCase("tr-TR").trim();return data.filter(i=>(filter==="Tümü"||i.className===filter)&&(!q||[i.name,i.family,i.type,i.className,...i.ench].join(" ").toLocaleLowerCase("tr-TR").includes(q)))},[query,filter]);
 return <main>
  <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">İ</span><span><strong>İKV</strong><small>EŞYA REHBERİ</small></span></a><nav><a href="#items">Eşyalar</a><a href="#how">Nasıl çalışır?</a><span className="beta">ALFA</span></nav></header>
  <section className="intro" id="top"><div><p className="eyebrow">TOPLULUK DESTEKLİ İKV VERİTABANI</p><h1>Aradığın eşya,<br/><em>tek bakışta.</em></h1><p className="lead">Eşyanın görünüş ailesini, efsun varyantlarını ve nereden düştüğünü tek yerde keşfet.</p></div><div className="search-panel"><label htmlFor="search">EŞYA ARA</label><div className="searchbox"><span>⌕</span><input id="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Örn. 49 balyoz, ateş..."/><kbd>ARA</kbd></div><p>İsim, eşya türü, sınıf veya efsunla arayabilirsin.</p></div></section>
  <section className="catalog" id="items"><div className="section-heading"><div><p className="eyebrow">İLK KOLEKSİYON</p><h2>49. seviye örnek eşyalar</h2></div><span className="count">{shown.length} KAYIT</span></div><div className="filter-row">{filters.map(f=><button key={f} className={filter===f?"active":""} onClick={()=>setFilter(f)}>{f}</button>)}</div>
  {shown.length?<div className="item-grid">{shown.map(i=><button className="item-card" key={i.id} onClick={()=>setSelected(i)}><div className={`item-art ${i.color}`}><span>{i.icon}</span><small>GÖRSEL BEKLENİYOR</small></div><div className="item-body"><div className="meta"><span>{i.className}</span><span>SV. 49</span></div><h3>{i.name}</h3><p>{i.family}</p><div className="tags">{i.ench.map(x=><span key={x}>{x}</span>)}</div><div className="source"><i/> Topluluk verisi bekleniyor</div></div><span className="arrow">↗</span></button>)}</div>:<div className="empty"><strong>Eşya bulunamadı.</strong><p>Arama kelimesini veya sınıfı değiştir.</p><button onClick={()=>{setQuery("");setFilter("Tümü")}}>Filtreleri temizle</button></div>}</section>
  <section className="how" id="how"><div><p className="eyebrow">GÖRÜNÜŞ ≠ EFSUN</p><h2>Aynı görünüş,<br/>farklı güçler.</h2></div><div className="steps"><article><b>01</b><h3>Görünüş ailesini bul</h3><p>Silah veya zırhın ortak modelini eşleştir.</p></article><article><b>02</b><h3>Efsununu karşılaştır</h3><p>Aynı görünüşü kullanan varyantları ayır.</p></article><article><b>03</b><h3>Kaynağa ulaş</h3><p>Doğrulanmış boss, yaratık, görev ya da reçeteyi gör.</p></article></div></section>
  <footer><span>İKV EŞYA REHBERİ · TOPLULUK PROJESİ</span><p>Bilgiler temsili olup oyuncu verisiyle doğrulanacaktır.</p></footer>
  {selected&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}><section className="detail" role="dialog" aria-modal="true"><button className="close" onClick={()=>setSelected(null)}>×</button><div className={`detail-art ${selected.color}`}><span>{selected.icon}</span><small>OYUN İÇİ GÖRSEL BEKLENİYOR</small></div><p className="eyebrow">{selected.className} · SV. 49 · {selected.type}</p><h2>{selected.name}</h2><p className="detail-note">{selected.family} ailesine ait örnek efsun varyantı.</p><h4>EFSUNLAR</h4><div className="enchant-list">{selected.ench.map(x=><span key={x}>✦ {x}</span>)}</div><h4>DÜŞME KAYNAĞI</h4><dl><div><dt>Kaynak</dt><dd>Topluluk verisi bekleniyor</dd></div><div><dt>Bölge</dt><dd>Henüz doğrulanmadı</dd></div><div><dt>Tür</dt><dd>Bilinmiyor</dd></div></dl><div className="warning">⚑ Bu kayıt henüz topluluk tarafından doğrulanmadı.</div></section></div>}
 </main>
}
