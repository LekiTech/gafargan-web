'use server';
export interface FoundSpelling {
  id: string;
  spelling: string;
  type: 'word' | 'variant';
}
