'use client';

import type { Book, Progress } from '@/lib/types';

type Props = {
  books: Book[];
  progress: Record<string, Progress>;
  onOpen: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
};

export function Library({ books, progress, onOpen, onDelete }: Props) {
  if (books.length === 0) {
    return (
      <div className="text-center text-muted py-16">
        <p className="text-5xl mb-3">📚</p>
        <p className="text-sm mb-4">Tu biblioteca está vacía.</p>
        <p className="text-sm">Toca "Importar EPUB" para añadir tu primer libro.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {books.map((b) => {
        const p = progress[b.id];
        const pct = p ? Math.round(p.percentage * 100) : 0;
        return (
          <button
            key={b.id}
            onClick={() => onOpen(b.id)}
            className="group relative text-left bg-surface border border-theme rounded-2xl p-3 hover:bg-surface-hover transition-colors"
          >
            {/* Portada */}
            <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-surface-hover flex items-center justify-center mb-2">
              {b.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={URL.createObjectURL(b.cover)} alt={b.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">📕</span>
              )}
            </div>

            {/* Título / autor */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-theme truncate">{b.title}</p>
              {b.author && <p className="text-xs text-muted truncate">{b.author}</p>}
            </div>

            {/* Progreso */}
            {pct > 0 && (
              <div className="mt-2">
                <div className="w-full h-1 rounded-full bg-surface-hover overflow-hidden">
                  <div className="h-full bg-[#22C55E]" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-muted mt-0.5">{pct}%</p>
              </div>
            )}

            {/* Botón borrar (hover) */}
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
              className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Borrar ${b.title}`}
            >
              🗑️
            </span>
          </button>
        );
      })}
    </div>
  );
}
