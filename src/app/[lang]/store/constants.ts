import { DictionaryLang } from '../api/types';

// compile and runtime immutability
export const WebsiteLangs = ['eng', 'rus', 'lez'] as const;
export const DictionaryLangs = ['lez', 'rus', 'tab'] as const;

// compile-time immutability
// but not true runtime immutability
// need it to perform language searches using the string variables
export const DictionaryPairs: ReadonlyArray<[l1: DictionaryLang, l2: DictionaryLang]> = [
  ['lez', 'rus'],
  ['tab', 'rus'],
];
