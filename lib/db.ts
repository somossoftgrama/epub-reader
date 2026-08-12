import Dexie, { type Table } from 'dexie';
import type { Book, Progress } from './types';

class EpubDB extends Dexie {
  books!: Table<Book, string>;
  progress!: Table<Progress, string>;

  constructor() {
    super('epub-reader');
    this.version(1).stores({
      books: 'id, title, addedAt',
      progress: 'id',
    });
  }
}

export const db = new EpubDB();
