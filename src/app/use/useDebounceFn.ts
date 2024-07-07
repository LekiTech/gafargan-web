export const useDebounceFn = <T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function(...args) {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => fn(...args), delay);
    };
};