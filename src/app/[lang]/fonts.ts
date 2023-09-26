import { Playfair_Display, Open_Sans, Lusitana } from 'next/font/google';

export const expressionFont = Playfair_Display({
  weight: '400',
  subsets: ['cyrillic', 'latin'],
});

export const opensansFont = Open_Sans({
  weight: '400',
  subsets: ['cyrillic', 'latin'],
});

export const lusitanaFont = Lusitana({
  weight: '400',
  subsets: ['latin'], //'cyrillic',
});
