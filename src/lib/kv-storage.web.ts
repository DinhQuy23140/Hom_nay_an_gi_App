/** Web: dùng localStorage thay cho expo-sqlite (cần WebAssembly worker). */
function storage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export const kvStorage = {
  getItem: async (key: string) => storage()?.getItem(key) ?? null,
  setItem: async (key: string, value: string) => {
    storage()?.setItem(key, value);
  },
  removeItem: async (key: string) => {
    storage()?.removeItem(key);
  },
};
