// compile and runtime immutability
export const WebsiteLangs = ['eng', 'rus', 'lez', 'tur'] as const;
export const DictionaryLangs = ['lez', 'rus', 'tab'] as const;

export const LangToId: Record<string, number> = Object.freeze({
  lez: 1,
  tab: 24,
  rus: 25,
  eng: 26,
  tur: 27,
  aze: 28,
  // Persian OLD
  // Modern Standard Arabic
  // Old Arabic (Quranic)
});
