export const normalizeSearch = (value: string) => value
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")
  .replace(/ı/g, "i")
  .toLocaleLowerCase("tr-TR")
  .trim();

export const matchesSearch = (haystack: string, query: string) => {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const normalizedHaystack = normalizeSearch(haystack);
  return words.every((word) => normalizedHaystack.includes(word));
};
