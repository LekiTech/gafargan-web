export const useDebounceFn = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let isFirstCall = true;

  return function (...args) {
    if (isFirstCall) {
      fn(...args);
      isFirstCall = false;
      return;
    }
    console.log('debounce', args);
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => fn(...args), delay);
  };
};
