'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { repo } from '@/lib/repository';
import type { Book, Progress } from '@/lib/types';
import { nowISO } from '@/lib/types';

// epubjs usa APIs del navegador → cargar solo en cliente
const Reader = dynamic(() => import('@/components/reader').then((m) => m.Reader), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center bg-app text-theme"><p className="text-muted">Abriendo libro...</p></div>,
});

export default function BookPage() {
  const { id } = useParams();
  const bookId = Array.isArray(id) ? id[0] : id;

  const [book, setBook] = useState<Book | null>(null);
  const [initialLoc, setInitialLoc] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!bookId) return;
      const bs = await repo.listBooks();
      const found = bs.find((b) => b.id === bookId);
      if (found) {
        setBook(found);
        const p: Progress | undefined = await repo.getProgress(found.id);
        if (p?.location) setInitialLoc(p.location);
      }
      setReady(true);
    }
    load();
  }, [bookId]);

  async function handleProgress(location: string, chapterIndex: number, percentage: number) {
    if (!bookId) return;
    const p: Progress = {
      id: bookId,
      location,
      chapterIndex,
      percentage,
      updatedAt: nowISO(),
    };
    await repo.saveProgress(p);
  }

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center bg-app text-theme"><p className="text-muted">Cargando...</p></div>;
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-theme">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-muted mb-4">No se encontró el libro.</p>
          <a href="/" className="text-[#22C55E] underline">Volver a la biblioteca</a>
        </div>
      </div>
    );
  }

  return (
    <Reader
      key={book.id}
      book={book}
      initialLocation={initialLoc}
      onProgress={handleProgress}
    />
  );
}
