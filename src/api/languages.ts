// compile and runtime immutability
export const WebsiteLangs = ['eng', 'rus', 'lez', 'tur'] as const;
export const DictionaryLangs = ['lez', 'rus', 'tab'] as const;

// TODO: refactor all by using either lang_dialect ID values or NAME values
export const LangToId: Record<string, number[]> = Object.freeze({
  lez: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  tab: [24],
  rus: [25],
  eng: [26],
  tur: [27],
  aze: [28],
  // Persian OLD
  // Modern Standard Arabic
  // Old Arabic (Quranic)
});
export const IdToLang: Record<number, string> = Object.freeze({
  0: '',
  1: 'lez',
  2: 'lez',
  3: 'lez',
  4: 'lez',
  5: 'lez',
  6: 'lez',
  7: 'lez',
  8: 'lez',
  9: 'lez',
  10: 'lez',
  11: 'lez',
  12: 'lez',
  13: 'lez',
  14: 'lez',
  15: 'lez',
  16: 'lez',
  17: 'lez',
  18: 'lez',
  19: 'lez',
  20: 'lez',
  21: 'lez',
  22: 'lez',
  23: 'lez',
  24: 'tab',
  25: 'rus',
  26: 'eng',
  27: 'tur',
  28: 'aze',
  // Persian OLD
  // Modern Standard Arabic
  // Old Arabic (Quranic)
});
