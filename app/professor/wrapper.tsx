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
import { ProvedorProfessor } from "@/context/provider-professor";
import { ListarAvaliacoes, listarTemasMes, listarTemas, ListarCriterios } from "@/actions/avaliacao";
import { listarMentoriasMes } from "@/actions/mentoria";
import { listarAlunosGoogle } from "@/actions/alunos";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { InstalarIos } from "@/hooks/instalar-ios";
import { ProvedorTemas } from "@/context/provedor-temas";
import { Prisma } from "../generated/prisma";

type ConfiguracaoComCores = Prisma.ConfiguracaoGetPayload<{
  include: { coresSistema: true };
}>;

export default async function ProfessorWrapper({
  children,
  configuracoes
}: Readonly<{
  children: React.ReactNode;
  configuracoes: ConfiguracaoComCores;
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
  const [avaliacoes, mentorias, temas, alunos] = await Promise.all([
    ListarAvaliacoes(undefined, undefined, 1, 12),
    listarMentoriasMes(),
    listarTemas(),
    listarAlunosGoogle('', 1, 12)
  ]);

  const criterios = await ListarCriterios();

  return (
    <>
      <ProvedorTemas
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <InstalarIos />
        <PwaInstallPrompt />
        <InicializarNotificacoes userId={userId} />
        <ProvedorProfessor configuracoes={configuracoes} userId={userId} avaliacoes={avaliacoes} mentorias={mentorias} temas={temas} alunos={alunos} criterios={criterios}>
          <SidebarProvider>
            <AppSidebar logo={configuracoes.logoSistema} />
            <SidebarInset className="relative">
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster richColors theme="light" />
        </ProvedorProfessor>
      </ProvedorTemas>
    </>
  );
}
