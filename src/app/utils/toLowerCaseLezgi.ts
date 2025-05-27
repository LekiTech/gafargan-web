import { normalizeLezgiString } from './normalizeLezgi';

export function toLowerCaseLezgi(
  lezgiString: string,
  options: { capitalize: boolean } = { capitalize: false },
) {
  const lowerCased = lezgiString?.toLowerCase(); //.replaceAll(/(?<=[кптцчКПТЦЧ])[i1lӏ|!]/g, 'I');
  const normalizedString = normalizeLezgiString(lowerCased);

  if (options.capitalize) {
    return normalizedString.charAt(0).toUpperCase() + normalizedString.slice(1);
  }
  return normalizedString;
}
