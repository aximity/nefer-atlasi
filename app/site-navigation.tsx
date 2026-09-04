"use client";

import Link from "next/link";
import { useState } from "react";
import { moduleGroups, moduleTabs, type MainModule } from "./site-modules";

export function SiteHeader({
  menuOpen,
  onOpenSearch,
  onToggleMenu,
}: {
  menuOpen: boolean;
  onOpenSearch: () => void;
  onToggleMenu: () => void;
}) {
  return (
    <header className="siteHeader">
      <Link className="brand" href="/" aria-label="Nefer Atlası ana sayfa">
        <b className="brandMark">N</b>
        <span className="brandName"><strong>NEFER ATLASI</strong><small>KÖ BİLGİ PLATFORMU</small></span>
      </Link>
      <nav className="top-status" aria-label="Açık modül">
        <button className="globalSearchTrigger" type="button" onClick={onOpenSearch} aria-label="Atlas genelinde ara">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/></svg>
          <b>Atlas’ta ara</b><small aria-hidden="true">/</small>
        </button>
        <button className="siteMenuTrigger" type="button" aria-expanded={menuOpen} onClick={onToggleMenu}>Menü <i aria-hidden="true">{menuOpen ? "×" : "+"}</i></button>
      </nav>
    </header>
  );
}

export function SiteMenu({
  activeModule,
  onClose,
  onOpenModule,
}: {
  activeModule: MainModule | null;
  onClose: () => void;
  onOpenModule: (id: MainModule) => void;
}) {
  const activeGroup = activeModule ? moduleGroups.find((group) => group.ids.includes(activeModule)) : null;
  const [menuGroup, setMenuGroup] = useState(activeGroup?.label ?? "Bilgi");
  return (
    <div className="siteMenuOverlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="siteMenu" role="dialog" aria-modal="true" aria-label="Site menüsü">
        <header><span><small>NEFER ATLASI</small><h2>Bölümler</h2></span><button type="button" onClick={onClose} aria-label="Menüyü kapat">×</button></header>
        <nav className="siteMenuGroups" aria-label="Bölüm grupları">
          {moduleGroups.map((group) => <button type="button" key={group.label} className={menuGroup === group.label ? "active" : ""} aria-pressed={menuGroup === group.label} onClick={() => setMenuGroup(group.label)}><span>{group.label}</span><small>{group.ids.length}</small></button>)}
        </nav>
        <div className="siteMenuPanel">
          {moduleGroups.filter((group) => group.label === menuGroup).map((group) => <section key={group.label}><header><b>{group.label}</b><small>{group.note} · {group.ids.length} bölüm</small></header>{group.ids.map((id) => { const item = moduleTabs.find((row) => row.id === id); return item && <button type="button" key={id} className={activeModule === id ? "active" : ""} onClick={() => onOpenModule(id)}><span><b>{item.label}</b><small>{item.summary}</small></span><i>→</i></button>; })}</section>)}
        </div>
        <footer><a href="/uretim">Üretim takibi</a><a href="/rehber">Kullanım rehberi</a><a href="https://kiyametoyun.net/" target="_blank" rel="noreferrer">Oyuna git ↗</a></footer>
      </aside>
    </div>
  );
}
