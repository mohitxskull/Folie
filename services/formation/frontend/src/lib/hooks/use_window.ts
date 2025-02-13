export const useWindow = () => {
  return typeof window !== "undefined" ? window : null;
};
