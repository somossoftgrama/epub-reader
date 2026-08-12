'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ePub from 'epubjs';
import type EpubBook from 'epubjs/types/book';
import type { Book } from '@/lib/types';

type Props = {
  book: Book;
  initialLocation?: string;
  onProgress: (location: string, chapterIndex: number, percentage: number) => Promise<void>;
};

type TocItem = { label: string; href: string };

export function Reader({ book, initialLocation, onProgress }: Props) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const epubRef = useRef<EpubBook | null>(null);
  const renditionRef = useRef<any>(null);
  const touchX = useRef<number | null>(null);

  const [toc, setToc] = useState<TocItem[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(135); // % por defecto (≈ 7 toques de A+)
  const [dark, setDark] = useState(false);       // modo claro por defecto

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const buf = await book.file.arrayBuffer();
      const epub = ePub(buf);
      epubRef.current = epub;

      const nav = await epub.loaded.navigation;
      const items: TocItem[] = (nav.toc || []).map((t: any) => ({ label: t.label, href: t.href }));
      if (!cancelled) setToc(items);

      if (hostRef.current) {
        const rendition = epub.renderTo(hostRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });
        renditionRef.current = rendition;

        // Tema inicial
        rendition.themes.register('custom', {
          body: { 'font-size': `${fontSize}%` },
        });
        rendition.themes.select('custom');
        applyTheme(dark);

        // Guardar progreso al reubicar
        rendition.on('relocated', (location: any) => {
          if (location && location.start) {
            const loc = location.start;
            const pct = location.start.percentage || 0;
            onProgress(loc.cfi, toc.findIndex((t) => t.href === loc.href) >= 0 ? toc.findIndex((t) => t.href === loc.href) : 0, pct);
          }
        });

        if (initialLocation) {
          await rendition.display(initialLocation);
        } else {
          await rendition.display();
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      renditionRef.current?.destroy();
      epubRef.current?.destroy();
      renditionRef.current = null;
      epubRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  async function goTo(href: string) {
    const rendition = renditionRef.current;
    if (!rendition) return;
    await rendition.display(href);
    setShowToc(false);
  }

  function prev() {
    renditionRef.current?.prev();
  }
  function next() {
    renditionRef.current?.next();
  }

  // Swipe para pasar página (izquierda = siguiente, derecha = anterior)
  function handleTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    const threshold = 60;
    if (dx < -threshold) next();
    else if (dx > threshold) prev();
  }

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    applyTheme(nextDark);
  }

  // Aplica fondo + color de texto del tema al contenido del EPUB
  function applyTheme(isDark: boolean) {
    const rendition = renditionRef.current;
    if (!rendition || !rendition.themes) return;
    rendition.themes.override('background', isDark ? '#0A0A0A' : '#ffffff');
    rendition.themes.override('color', isDark ? '#E5E7EB' : '#1A1A1A');
  }

  function changeFont(delta: number) {
    const rendition = renditionRef.current;
    if (!rendition) return;
    const next = Math.min(150, Math.max(80, fontSize + delta));
    setFontSize(next);
    rendition.themes.override('font-size', `${next}%`);
  }

  return (
    <div className={`h-screen flex flex-col ${dark ? 'bg-app text-theme' : 'bg-white text-black'}`}>
      {/* Barra superior */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-theme shrink-0">
        <button onClick={() => router.push('/')} className="text-muted hover:text-theme px-2" aria-label="Volver">
          ←
        </button>
        <button onClick={() => setShowToc((s) => !s)} className="text-sm text-muted hover:text-theme truncate max-w-[40%]" title="Índice">
          ☰ {book.title}
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => changeFont(-5)} className="text-sm px-2 text-muted hover:text-theme" aria-label="Reducir letra">A−</button>
          <button onClick={() => changeFont(5)} className="text-lg px-2 text-muted hover:text-theme" aria-label="Aumentar letra">A+</button>
          <button onClick={toggleTheme} className="px-2 text-muted hover:text-theme" aria-label="Tema">
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Índice */}
      {showToc && (
        <>
          <div className="fixed inset-0 z-10 bg-black/50" onClick={() => setShowToc(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-surface border-r border-theme z-20 overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-3 border-b border-theme bg-surface">
              <span className="text-sm font-semibold text-muted uppercase tracking-wider">Índice</span>
              <button
                onClick={() => setShowToc(false)}
                className="text-2xl leading-none text-muted hover:text-theme"
                aria-label="Cerrar índice"
              >
                ×
              </button>
            </div>
            <ul>
              {toc.length === 0 && <li className="p-3 text-sm text-muted">Sin índice disponible</li>}
              {toc.map((t) => (
                <li key={t.href}>
                  <button onClick={() => goTo(t.href)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-hover">
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Área del libro */}
      <div
        className="flex-1 relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={hostRef} className="absolute inset-0" />
      </div>

      {/* Barra inferior: navegación */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-theme shrink-0">
        <button onClick={prev} className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm font-medium">‹ Anterior</button>
        <button onClick={next} className="px-4 py-2 rounded-lg bg-[#22C55E] text-white text-sm font-semibold hover:bg-[#16A34A]">Siguiente ›</button>
      </div>
    </div>
  );
}
