import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ProfessorWrapper from "./wrapper";
import { Suspense } from "react";
import Loading from "./(dashboard)/loading";
import { Analytics } from "@vercel/analytics/next";
import { obterInformacoes } from "@/actions/configuracoes";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap', // Or 'fallback' or 'optional'
});


export async function generateMetadata(): Promise<Metadata> {
  const informacoes = await obterInformacoes()

  const metadata: Metadata = {
    title: `${informacoes?.nomePlataforma} - Professor` || "Plataforma Educacional",
    description: informacoes?.slogan || 'Plataforma educacional para aprimorar suas habilidades de redação.',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: `${informacoes?.nomePlataforma} - Professor` || "Plataforma Educacional",
    },
    icons: {
      apple: '/ios/180.png',
    },
  };

  return metadata
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // fetch here so cache invalidation (updateTag) works correctly on server revalidation
  const configuracoes = await obterInformacoes();

  // Monta a string de variáveis apenas se houver cores salvas
  const themeStyle = configuracoes?.coresSistema
    ? `
  :root {
    --primary: ${configuracoes.coresSistema[0].valor};
    --primary-foreground: ${configuracoes.coresSistema[1].valor};
    --secondary: ${configuracoes.coresSistema[2].valor};
    --secondary-foreground: ${configuracoes.coresSistema[3].valor};
  }
`: null

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {themeStyle && <style>{themeStyle}</style>}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={`${configuracoes?.nomePlataforma} - Professor` || "Plataforma Educacional - Professor"} />
        <link rel="apple-touch-icon" href="/ios/180.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body
        className={`${poppins.className} antialiased`}
      >
        <Suspense fallback={<Loading />}>
          <ProfessorWrapper configuracoes={configuracoes!}>
            {children}
          </ProfessorWrapper>
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
