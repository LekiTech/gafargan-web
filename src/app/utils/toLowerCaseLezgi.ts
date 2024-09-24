export function toLowerCaseLezgi(
  lezgiString: string,
  options: { capitalize: boolean } = { capitalize: false },
) {
  const lowerCased = lezgiString?.toLowerCase().replaceAll(/(?<=[кптцчКПТЦЧ])[i1lӏ|!]/g, 'I');
  if (options.capitalize) {
    return lowerCased.charAt(0).toUpperCase() + lowerCased.slice(1);
  }
  return lowerCased;
}
