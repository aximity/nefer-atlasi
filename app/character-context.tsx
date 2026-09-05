"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { talismans, type CharacterClass } from "../lib/catalog";

type CharacterContextValue = {
  klass: CharacterClass;
  talismanId: string;
  setClass: (klass: CharacterClass) => void;
  setTalismanId: (id: string) => void;
  openTalisman: (id: string) => void;
};

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [klass, setKlass] = useState<CharacterClass>("Büyücü");
  const [talismanId, setTalismanState] = useState("");
  const setClass = useCallback((next: CharacterClass) => {
    setKlass(next);
    setTalismanState("");
  }, []);
  const setTalismanId = useCallback((id: string) => setTalismanState(id), []);
  const openTalisman = useCallback((id: string) => {
    const talisman = talismans.find((item) => item.id === id);
    if (!talisman) return setTalismanState("");
    setKlass(talisman.class);
    setTalismanState(talisman.id);
  }, []);
  const value = useMemo(
    () => ({ klass, talismanId, setClass, setTalismanId, openTalisman }),
    [klass, openTalisman, setClass, setTalismanId, talismanId],
  );
  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}

export function useCharacter() {
  const value = useContext(CharacterContext);
  if (!value) throw new Error("useCharacter must be used within CharacterProvider");
  return value;
}
