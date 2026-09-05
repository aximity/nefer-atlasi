"use client";

import { talismans } from "../lib/catalog";
import TalismanProductionAtlas from "./TalismanProductionAtlas";
import Title from "./section-title";

export default function TalismanGuide() {
  return <section className="engine" id="engine">
    <Title eyebrow="TILSIM REHBERİ" title="Ne işe yarar, nereden elde edilir?">
      <span className="count">{talismans.length} tılsım · etki ve edinme bilgisi</span>
    </Title>
    <TalismanProductionAtlas />
  </section>;
}
