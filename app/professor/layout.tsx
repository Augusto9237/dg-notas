import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { InicializarNotificacoes } from "@/components/inicializar-notificacoes";

const poppins = Poppins({
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'], // Specify the weights you need
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

  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (!session?.user) {
    redirect('/')
  }

  if (session.user.role !== 'admin') {
    await auth.api.signOut({
      headers: await headers()
    })
    redirect('/')
  }

  const userId = session.user.id;
  return (
    <html lang="pt-BR">
      <head>
        {/* ↓↓↓ ADICIONE ISTO ↓↓↓ */}
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
        <InicializarNotificacoes userId={userId} />
        <SidebarProvider>
          <div suppressHydrationWarning>
            <AppSidebar />
          </div>
          <SidebarInset className="relative">
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Toaster richColors theme="light" />
      </body>
    </html>
  );
}
