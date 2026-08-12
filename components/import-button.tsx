'use client';

import { useState } from 'react';
import ePub from 'epubjs';
import type EpubBook from 'epubjs/types/book';
import { repo } from '@/lib/repository';
import type { Book } from '@/lib/types';
import { nowISO, uid } from '@/lib/types';
import { Library } from '@/components/library';

export function ImportButton({ onImported }: { onImported: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const book: EpubBook = ePub(buf);
      const meta = await book.loaded.metadata;
      const title = (meta.title as string) || file.name.replace(/\.epub$/i, '');
      const author = (meta.creator as string) || undefined;

      let cover: Blob | null = null;
      try {
        const url = await book.coverUrl();
        if (url) {
          const res = await fetch(url);
          cover = await res.blob();
        }
      } catch {
        cover = null;
      }

      await repo.saveBook({
        id: uid(),
        title,
        author,
        cover,
        file,
        fileName: file.name,
        addedAt: nowISO(),
      });
      await onImported();
    } catch (e) {
      console.error('Error importando EPUB', e);
      alert('No se pudo leer ese archivo. ¿Es un EPUB válido?');
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#22C55E] text-white font-semibold hover:bg-[#16A34A] transition-colors cursor-pointer">
      <span>{busy ? 'Importando...' : '📥 Importar EPUB'}</span>
      <input
        type="file"
        accept=".epub,application/epub+zip"
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
    </label>
  );
}
