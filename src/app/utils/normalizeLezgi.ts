/*
 * Adapted from the original Java code by: Arthur Magomedov
 */

/**
 * Replaces certain characters in a given line with the uppercase letter "I".
 * The characters that will be replaced are "i", "1", "l", "ӏ", "|" and "!"
 * if they are preceded by any of the following characters:
 * "к", "п", "т", "ц", "ч", "К", "П", "Т", "Ц" or "Ч".
 * <p>
 * This normalization method is tested and works for the Lezgi and Tabasaran languages.
 * The other languages may not fit.
 * <p>
 * This method can be static because it is a "pure function"
 * and does not change the "state" outside its scope.
 *
 * @param line the input line where replacements will be made.
 * @return a new string with the specified characters replaced by "I".
 */
export function replaceVerticalBar(line: string): string {
  return line.replace(/(?<=[кптцчКПТЦЧ])[i1lӏ|!Ӏ]/gm, 'I');
}

/**
 * Trims excess spaces in a given line by replacing consecutive whitespace characters with a single space
 * and then trimming any leading or trailing spaces.
 *
 * @param line the input line where excess spaces will be trimmed.
 * @return a new string with excess spaces removed.
 */
function trimSpaces(line: string): string {
  return line.replaceAll(/\s+/gm, ' ').trim();
}

/**
 * Normalizes the given string by performing the following steps:
 * 1. Replaces vertical bars with a specific replacement using the {@link #replaceVerticalBar(String)} method.
 * 2. Removes punctuation characters (.,?!).
 * 3. Trims leading and trailing spaces using the {@link #trimSpaces(String)} method.
 *
 * @param line the input string to be normalized.
 * @return the normalized string after replacing vertical bars, removing punctuation, and trimming spaces.
 * @see #replaceVerticalBar(String)
 * @see #trimSpaces(String)
 */
export function normalizeLezgiString(line: string): string {
  /* Executed first before the 'replaceAll()' method to avoid errors when using the '!'
     instead of a stick in letters with a stick (кI, тI, пI ...). */
  const resultAfterReplacingVerticalBar = replaceVerticalBar(line);
  const resultAfterRemovingPunctuation = resultAfterReplacingVerticalBar.replaceAll(/[,.?!]/gm, '');
  /* The 'trimSpaces()' method is executed last, after the 'replaceAll()' method,
     to handle cases where spaces can be before and after punctuation marks ("вун атуй , рагъ атуй!", etc.). */
  return trimSpaces(resultAfterRemovingPunctuation);
}
