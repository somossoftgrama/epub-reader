# Lector (EPUB Reader)

App personal para leer libros EPUB en el teléfono. Se instala como PWA, funciona offline y guarda todo localmente en el dispositivo.

## Funciones

- Importar archivos `.epub` (título, autor y portada se extraen automáticamente).
- Biblioteca con portadas y progreso de lectura.
- Lector con navegación por capítulos e índice (TOC).
- Recordar la posición: cierras el libro y sigues donde ibas.
- Tema oscuro/claro y ajuste de tamaño de letra.

## Arquitectura

- **PWA** sobre Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.
- **Parseo del EPUB client-side** con `epubjs` (descomprime y renderiza capítulos sin servidor).
- **Datos locales** en IndexedDB vía Dexie (`lib/db.ts`): libros + posición de lectura (CFI).
- **Capa de repositorio agnóstica** (`lib/repository.ts`): la UI solo conoce la interfaz `ReaderRepository`. Si mañana se quiere sincronización/backend, se crea `ApiRepository` y se intercambia sin tocar la UI.
- **Sin servidor ni cuentas**: los libros viven solo en el dispositivo.

## Nota técnica

`epubjs` usa APIs del navegador (ArrayBuffer, Blob), por eso el componente lector se carga con `next/dynamic` + `ssr: false`.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Deploy

Conectar el repo a Vercel (build automático).
