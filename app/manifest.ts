import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    theme_color: '#f4efe3',
    background_color: '#003d8b',
    icons: [
      {
        purpose: 'maskable',
        sizes: '512x512',
        src: '/icon512_maskable.png',
        type: 'image/png',
      },
      {
        purpose: 'any',
        sizes: '512x512',
        src: '/icon512_rounded.png',
        type: 'image/png',
      },
    ],
    orientation: 'portrait',
    display: 'fullscreen',
    dir: 'auto',
    lang: 'pt-BR',
    name: 'DG - Curso de Redação',
    short_name: 'DG - Redação',
    // start_url: 'https://dg-redacao.vercel.app/',
    // scope: 'https://dg-redacao.vercel.app/',
    // id: 'https://dg-redacao.vercel.app/aluno',
    description: 'A plataforma de curso de redação',
  }
}