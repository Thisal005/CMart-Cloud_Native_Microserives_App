/**
 * Type-safe browser LocalStorage wrappers with SSR check safety filters.
 */
export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error(`[Storage Utility Error] Failed to get key "${key}":`, error);
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[Storage Utility Error] Failed to set key "${key}":`, error);
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage Utility Error] Failed to remove key "${key}":`, error);
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error("[Storage Utility Error] Failed to clear storage:", error);
    }
  },
};
