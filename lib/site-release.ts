export const SITE_RELEASE = {
  version: "0.43.0",
  channel: "BETA",
  milestone: "M43",
  releasedAt: "28 Ağustos 2026",
  title: "Tam İksir Üretimi",
  summary:
    "İKV Wiki'deki 79 iksir reçetesi seviye, tür, malzeme ve adetleriyle kataloğa ve üretim takibine bağlandı.",
  changes: [
    "İksir dizini gerçek açılır reçete kartlarına dönüştürüldü.",
    "Can, kudret ve destek iksirleri ortak renk/görünüş ailelerine bağlandı.",
    "İksirler favoriye eklenebilir ve cihazdaki stokla üretilebilirlik hesabına katılır.",
    "Üretim takibinde iksir hedefi, eksik miktar ve malzeme kaynağı diğer reçetelerle birlikte gösterilir.",
  ],
} as const;
