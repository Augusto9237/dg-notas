import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DG - Curso de Redação',
    short_name: 'DG - Redação',
    description: 'A plataforma de curso de redação',
    start_url: '/',
    scope: '/',
    orientation: 'portrait-primary',
    display: 'standalone',
    dir: 'ltr',
    lang: 'pt-BR',
    background_color: '#003d8b',
    theme_color: '#003d8b',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/icon512_maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon512_rounded.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon192_maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}