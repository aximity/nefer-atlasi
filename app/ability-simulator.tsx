"use client";

import {useMemo,useState} from "react";
import type {CharacterClass} from "../lib/catalog";

type Ability={name:string;note:string};
const budget=80;
const abilities:Record<CharacterClass,Ability[]>={
  "Büyücü":[
    {name:"Meteorit",note:"Fiziksel büyü hasarı"},{name:"Buz Oku",note:"Buz hasarı ve yavaşlatma"},{name:"Yıldırım",note:"Elektrik hasarı"},{name:"Ateş Çemberi",note:"Alan ateş hasarı"},{name:"Kutup Rüzgarı",note:"Kontrol"},{name:"Direnç Kırma",note:"Grup desteği"},{name:"Zihin Saldırısı",note:"Bazı güçlü hedefleri kilitleme"},{name:"Meditasyon",note:"Kudret yönetimi"},{name:"Tesla Küresi",note:"Sığınak için 1 puan rehber alternatifi"},{name:"Büyü Bozma",note:"Güçlendirme temizleme"}
  ],
  "Şifacı":[
    {name:"İyileştirme",note:"Tek hedef iyileştirme"},{name:"İyileştirme Çemberi",note:"Kriz anı grup iyileştirmesi"},{name:"Element Direnç Alanı",note:"İki şifacılı grupta görev paylaşımı"},{name:"Fiziksel Direnç Alanı",note:"İki şifacılı grupta görev paylaşımı"},{name:"Ruh Kalkanı",note:"Zırh desteği"},{name:"Büyü Bozma",note:"Kanama ve güçlendirme temizleme"},{name:"Meditasyon",note:"Kudret yönetimi"},{name:"Çağrı",note:"Kudret maliyetli alternatif"}
  ],
  "Savaşçı":[
    {name:"Sarsılmaz",note:"Tank acil durum ve hiddet kontrolü"},{name:"Kışkırtma",note:"Hedef hiddeti"},{name:"Savaş Narası",note:"Grup hiddeti"},{name:"Boz Ayı",note:"Kesim için gerekli değil"},{name:"Zihin Toplama",note:"Korteks/Ayartma karşısında önemli"},{name:"Durdurma",note:"Kontrol alternatifi"},{name:"Süpürme Saldırısı",note:"Hiddet aktarımı"},{name:"Depar",note:"Grup bölgelerinde kullanılamaz"}
  ]
};
const presets:Record<CharacterClass,{name:string;points:Record<string,number>;note:string}[]>={
  "Büyücü":[{name:"Sığınak başlangıcı",points:{"Tesla Küresi":1},note:"Rehber Tesla Küresi için 1 puanı yeterli başlangıç olarak veriyor; kalan puanlar grup rolüne göre dağıtılır."}],
  "Şifacı":[{name:"Tek şifacı başlangıcı",points:{"Büyü Bozma":1,"İyileştirme Çemberi":1},note:"Rehber Büyü Bozma için 1 puanı genel kullanımda yeterli, İyileştirme Çemberi 1'i kriz alternatifi olarak gösteriyor."},{name:"İki şifacı · element",points:{"Element Direnç Alanı":15,"Büyü Bozma":1},note:"Diğer şifacı Fiziksel Direnç Alanını üstlenmelidir."}],
  "Savaşçı":[{name:"Sığınak tankı",points:{"Sarsılmaz":15,"Kışkırtma":1,"Savaş Narası":15},note:"Rehberdeki açık alternatiflerden biridir; grup stratejisine göre Kışkırtma 15 / Savaş Narası 1 ters dağılımı da seçilebilir."},{name:"Çemberlitaş zihin",points:{"Zihin Toplama":15,"Sarsılmaz":15,"Kışkırtma":1},note:"Korteks ve Ayartma etkileri için rehber Zihin Toplama 15'i kritik görüyor."}]
};

export default function AbilitySimulator({klass}:{klass:CharacterClass}){
  const [points,setPoints]=useState<Record<string,number>>({});
  const [presetName,setPresetName]=useState("");
  const spent=useMemo(()=>Object.values(points).reduce((a,b)=>a+b,0),[points]),remaining=budget-spent;
  const set=(name:string,value:number)=>{const current=points[name]??0,next=Math.max(0,Math.min(15,value)),without=spent-current;setPoints({...points,[name]:Math.min(next,budget-without)});setPresetName("")};
  const applyPreset=(name:string)=>{const preset=presets[klass].find(x=>x.name===name);setPresetName(name);setPoints(preset?.points??{})};
  const selectedPreset=presets[klass].find(x=>x.name===presetName);
  return <section className="abilitySimulator"><div className="abilityHead"><div><small>YETENEK SİMÜLASYONU</small><h3>{klass} puan planı</h3></div><strong className={remaining<0?"over":""}>{spent}/{budget}<span> · kalan {remaining}</span></strong></div><label className="presetSelect"><span>Rehber başlangıcı</span><select value={presetName} onChange={e=>applyPreset(e.target.value)}><option value="">Boş plan</option>{presets[klass].map(x=><option key={x.name}>{x.name}</option>)}</select></label>{selectedPreset&&<p className="presetNote">{selectedPreset.note}</p>}<div className="abilityRows">{abilities[klass].map(ability=><label key={ability.name}><span><b>{ability.name}</b><small>{ability.note}</small></span><input aria-label={`${ability.name} puanı`} type="range" min="0" max="15" value={points[ability.name]??0} onChange={e=>set(ability.name,Number(e.target.value))}/><output>{points[ability.name]??0}/15</output></label>)}</div><div className="abilityAudit"><b>{remaining===0?"Puan planı tamamlandı":`${remaining} puan henüz dağıtılmadı`}</b><span>Her yetenek en fazla 15 puan. Şablonlar yalnız ekran görüntüsündeki metinde açıkça yazılan değerleri otomatik doldurur.</span><button onClick={()=>{setPoints({});setPresetName("")}}>Planı sıfırla</button></div></section>
}
