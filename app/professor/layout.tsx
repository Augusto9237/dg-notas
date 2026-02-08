import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ProfessorWrapper from "./wrapper";
import { Suspense } from "react";
import Loading from "./(dashboard)/loading";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap', // Or 'fallback' or 'optional'
});


export const metadata: Metadata = {
  title: "DG - Curso de Redação - Professor",
  description: 'Plataforma de correção de redações e agendamento de mentorias',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DG - Redação',
  },
  icons: {
    apple: '/ios/180.png',
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DG - Redação" />
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
          <ProfessorWrapper>
            {children}
          </ProfessorWrapper>
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
