import "../globals.css";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { InicializarNotificacoes } from "@/components/inicializar-notificacoes";
import { ProvedorProfessor } from "@/context/provider-professor";
import { ListarCriterios, listarTemasProfessor } from "@/actions/avaliacao";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { InstalarIos } from "@/hooks/instalar-ios";
import { ProvedorTemas } from "@/context/provedor-temas";
import { Prisma } from "../generated/prisma";
import { AppSidebarProfessor } from "@/components/app-sidebar-professor";
import { getSessionCached } from "@/lib/session";

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

  const session = await getSessionCached();

  if (!session?.user) {
    redirect('/')
  }


  const userId = session.user.id;

  // OTIMIZAÇÃO CRÍTICA: Executar todas as queries em paralelo
  const [temas, criterios] = await Promise.all([
    listarTemasProfessor(userId),
    ListarCriterios()
  ]);

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
        <ProvedorProfessor configuracoes={configuracoes} userId={userId} temas={temas} criterios={criterios}>
          <SidebarProvider>
            <AppSidebarProfessor logo={configuracoes.logoSistema} />
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
