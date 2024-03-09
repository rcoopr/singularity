import { IDBPDatabase, openDB } from 'idb';

export function openExtensionDatabase(): Promise<IDBPDatabase> {
  return openDB('snippets-store', 1, {
    upgrade(database) {
      database.createObjectStore('snippets', { keyPath: 'id' });
    },
  });
}
