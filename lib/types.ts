export type Book = {
  id: string;
  title: string;
  author?: string;
  cover?: Blob | null;   // imagen de portada extraída del EPUB
  file: Blob;            // el EPUB completo (para reabrirlo)
  fileName: string;
  addedAt: string;       // ISO timestamp
};

export type Progress = {
  id: string;            // = bookId (1 a 1)
  location: string;      // CFI/epubjs location (posición de lectura)
  chapterIndex: number;  // índice del capítulo actual
  percentage: number;    // 0-1 avance total
  updatedAt: string;
};

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
