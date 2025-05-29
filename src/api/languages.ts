// compile and runtime immutability
export const WebsiteLangs = ['eng', 'rus', 'lez', 'tur'] as const;
export const DictionaryLangs = ['lez', 'rus', 'tab'] as const;

// TODO: refactor all by using either lang_dialect ID values or NAME values
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
export const IdToLang: Record<number, string> = Object.freeze({
  0: '',
  1: 'lez',
  24: 'tab',
  25: 'rus',
  26: 'eng',
  27: 'tur',
  28: 'aze',
  // Persian OLD
  // Modern Standard Arabic
  // Old Arabic (Quranic)
});
