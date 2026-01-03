import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DG - Curso de Redação',
    short_name: 'DG - Redação',
    description: 'A plataforma de curso de redação',
    start_url: '/',
    orientation: 'portrait',
    display: 'standalone',
    dir: 'auto',
    lang: 'pt-BR',
    background_color: '#003d8b',
    theme_color: '#003d8b',
    icons: [
      {
       sizes: '512x512',
        src: '/icon512_maskable.png',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon512_rounded.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}