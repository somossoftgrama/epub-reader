import { db } from './db';
import type { Book, Progress } from './types';

// ─── Interfaz agnóstica ────────────────────────────────────────────────
// La UI usa SOLO esta interfaz. Hoy la implementación es local (IndexedDB).
// Si mañana hay backend/sincronización, se crea ApiRepository con la misma
// interfaz y se intercambia aquí — la UI no cambia.
export interface ReaderRepository {
  listBooks(): Promise<Book[]>;
  saveBook(b: Book): Promise<void>;
  deleteBook(id: string): Promise<void>;
  getProgress(bookId: string): Promise<Progress | undefined>;
  saveProgress(p: Progress): Promise<void>;
}

// ─── Implementación local (IndexedDB) ──────────────────────────────────
export class LocalRepository implements ReaderRepository {
  async listBooks(): Promise<Book[]> {
    const all = await db.books.toArray();
    return all.sort((a, b) => a.addedAt.localeCompare(b.addedAt));
  }

  async saveBook(b: Book): Promise<void> {
    await db.books.put(b);
  }

  async deleteBook(id: string): Promise<void> {
    await db.books.delete(id);
    await db.progress.delete(id);  // elimina progreso asociado
  }

  async getProgress(bookId: string): Promise<Progress | undefined> {
    return db.progress.get(bookId);
  }

  async saveProgress(p: Progress): Promise<void> {
    await db.progress.put(p);
  }
}

export const repo: ReaderRepository = new LocalRepository();
