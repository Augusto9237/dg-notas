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
import { ProverdorProfessor } from "@/context/provider-professor";
import { ListarAvaliacoes, listarTemasMes, ListarTemas } from "@/actions/avaliacao";
import { listarMentoriasMes } from "@/actions/mentoria";
import { listarAlunosGoogle } from "@/actions/alunos";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { InstalarIos } from "@/hooks/instalar-ios";
import { ProvedorTemas } from "@/context/provedor-temas";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

  // OTIMIZAÇÃO CRÍTICA: Executar todas as queries em paralelo
  const [avaliacoes, mentorias, temasMes, alunos] = await Promise.all([
    ListarAvaliacoes(undefined, undefined, 1, 10), 
    listarMentoriasMes(),
    ListarTemas(), // Chama sem params para default page 1
    listarAlunosGoogle('', 1, 12)
  ]);

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
        <ProvedorTemas
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <InstalarIos />
          <PwaInstallPrompt />
          <InicializarNotificacoes userId={userId} />
          <ProverdorProfessor userId={userId} avaliacoes={avaliacoes as any} mentorias={mentorias} temas={temasMes.data} alunos={alunos}>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="relative">
                {children}
              </SidebarInset>
            </SidebarProvider>
            <Toaster richColors theme="light" />
          </ProverdorProfessor>
        </ProvedorTemas>
        <SpeedInsights />
      </body>
    </html>
  );
}
