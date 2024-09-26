// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = (callbackFn: (...args: any[]) => void, wait: number) => {
  let debounceId: ReturnType<typeof setTimeout> | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...args: any[]) {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      callbackFn(...args);
    }, wait);
  };
};