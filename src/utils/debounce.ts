// src/utils/debounce.ts
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) {clearTimeout(timeout);}
    timeout = setTimeout(() => func(...args), wait);
  };
}
