import { Playfair_Display, Open_Sans, Lusitana, Rubik } from 'next/font/google';

export const playfairDisplayFont = Playfair_Display({
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

const rubikFont = Rubik({
  weight: '400',
  subsets: ['latin', 'cyrillic'],
});

export const expressionFont = rubikFont;
