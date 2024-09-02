export const cleanText = (input: string, replacements = ['undefined']) => {
  let result = input;
  replacements.forEach(replacement => {
    const regex = new RegExp(replacement, 'g');
    result = result.replace(regex, '');
  });
  return result;
}
