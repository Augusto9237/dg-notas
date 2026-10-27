import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import type { ReactNode } from "react"

import { obterInformacoes } from "@/actions/configuracoes"
// @ts-expect-error Next.js handles global CSS imports at build time.
import "../globals.css"
import { FooterMembro } from "@/components/ui/footer-membro"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
})

export async function generateMetadata(): Promise<Metadata> {
  const configuracoes = await obterInformacoes()

  return {
    title: configuracoes?.nomePlataforma
      ? `${configuracoes.nomePlataforma} - Área de membros`
      : "DG Redação - Área de membros",
    description:
      configuracoes?.slogan ??
      "Aulas, materiais e suporte para evoluir na redação.",
  }
}

export default async function MemberLayout({
  children,
}: {
  children: ReactNode
}) {
  const configuracoes = await obterInformacoes()
  const cores = configuracoes?.coresSistema
  const themeStyle =
    cores && cores.length >= 4
      ? `:root {
          --primary: ${cores[0].valor};
          --primary-foreground: ${cores[1].valor};
          --secondary: ${cores[2].valor};
          --secondary-foreground: ${cores[3].valor};
        }`
      : undefined

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>{themeStyle ? <style>{themeStyle}</style> : null}</head>
      <body className={`${poppins.className} antialiased`}>
        {children}
        <FooterMembro logo={configuracoes?.logoAplicativo!} />
      </body>
    </html>
  )
}
