import { moduleTabs, type MainModule } from "./site-modules.ts";
import { ROUTE_DETAIL_PARAMS } from "../lib/navigation.ts";

export type AtlasRoute = {
  module: MainModule | null;
  itemId: string;
  talismanId: string;
  questId: string;
  abilityId: string;
  regionName: string;
  bossName: string;
  buildCode: string;
  hashTarget: string;
};

export function readAtlasRoute(href: string): AtlasRoute {
  const url = new URL(href);
  const requestedModule = url.searchParams.get("module");
  const activeModule = requestedModule && moduleTabs.some((item) => item.id === requestedModule)
    ? requestedModule as MainModule
    : null;
  let hashTarget = url.hash.slice(1);
  try { hashTarget = decodeURIComponent(hashTarget); } catch { /* Malformed hashes cannot block navigation. */ }
  return {
    module: activeModule,
    itemId: url.searchParams.get("item") ?? "",
    talismanId: url.searchParams.get("talisman") ?? "",
    questId: url.searchParams.get("quest") ?? "",
    abilityId: url.searchParams.get("ability") ?? "",
    regionName: url.searchParams.get("region") ?? "",
    bossName: url.searchParams.get("boss") ?? "",
    buildCode: url.searchParams.get("build") ?? "",
    hashTarget,
  };
}

export function moduleHref(href: string, id: MainModule, params: Record<string, string> = {}) {
  const url = new URL(href);
  url.searchParams.set("module", id);
  ROUTE_DETAIL_PARAMS.forEach((key) => url.searchParams.delete(key));
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.hash = id;
  return url.href;
}

export function homeHref(href: string) {
  const url = new URL(href);
  return new URL(url.pathname, url.origin).href;
}

export function withoutItemHref(href: string) {
  const url = new URL(href);
  url.searchParams.delete("item");
  return url.href;
}
