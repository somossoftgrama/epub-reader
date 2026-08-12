'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { repo } from '@/lib/repository';
import type { Book, Progress } from '@/lib/types';
import { ImportButton } from '@/components/import-button';
import { Library } from '@/components/library';

export default function Home() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [ready, setReady] = useState(false);

  async function load() {
    const bs = await repo.listBooks();
    setBooks(bs);
    const map: Record<string, Progress> = {};
    for (const b of bs) {
      const p = await repo.getProgress(b.id);
      if (p) map[b.id] = p;
    }
    setProgress(map);
    setReady(true);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    await repo.deleteBook(id);
    await load();
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-theme">
        <p className="text-lg text-muted">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-theme pb-10">
      <header className="sticky top-0 z-10 backdrop-blur bg-app border-b border-theme px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">📖 Lector</h1>
          <ImportButton onImported={load} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6">
        <Library books={books} progress={progress} onOpen={(id) => router.push(`/book/${id}`)} onDelete={handleDelete} />
      </main>
    </div>
  );
}
