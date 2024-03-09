import { DictionaryLang } from '../../../api/types.model';
// compile-time immutability
// but not true runtime immutability
// need it to perform language searches using the string variables
export const DictionaryPairs: ReadonlyArray<[l1: DictionaryLang, l2: DictionaryLang]> = [
  ['lez', 'rus'],
  ['tab', 'rus'],
];
