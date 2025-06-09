export { copyText } from './copyText';
export { toLowerCaseLezgi } from './toLowerCaseLezgi';
export { normalizeLezgiString } from './normalizeLezgi';

/**
 * Wrapper arounf `parseInt` that allows both number and string as input and ensures that number or NaN are returned
 *
 * @param value string or number
 * @returns number or NaN
 */
export function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : parseInt(value);
}
