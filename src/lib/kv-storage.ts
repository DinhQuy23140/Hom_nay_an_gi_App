import Storage from 'expo-sqlite/kv-store';

/** Key-value store bền vững trên máy, tương thích interface AsyncStorage. */
export const kvStorage = {
  getItem: (key: string) => Storage.getItem(key),
  setItem: (key: string, value: string) => Storage.setItem(key, value),
  removeItem: async (key: string) => {
    await Storage.removeItem(key);
  },
};
