export const SITE_RELEASE = {
  version: "0.34.1",
  channel: "BETA",
  milestone: "M32.3",
  releasedAt: "26 Ağustos 2026",
  title: "Görev Geçmişi ve Masaüstü Okunabilirlik",
  summary:
    "Görev ayrıntılarında gerçek ön koşullar ile kaçırılmış olabilecek eski görevler ayrıldı; Meteor konumu ve masaüstü tipografisi iyileştirildi.",
  changes: [
    "Görev detayında zorunlu zincir ile daha düşük seviyede kaçırılmış olabilecek görevler ayrı listeleniyor.",
    "Önceki seviye görevlerinin NPC ve konumu aynı panelden açılabiliyor.",
    "Teşkilat İstihbarat'a Katılış konumu Mısır Çarşısı yerine Teşkilat karargâhı olarak düzeltildi.",
    "Masaüstü gövde, form ve yardımcı metin ölçüleri bir kademe büyütüldü; mobil ölçüler korunuyor.",
    "Başlık ve arayüz yazı aileleri daha rafine sistem font yığınlarıyla yenilendi; renk ve tema değiştirilmedi.",
  ],
} as const;
