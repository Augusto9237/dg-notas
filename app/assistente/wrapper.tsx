import "../globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { InicializarNotificacoes } from "@/components/inicializar-notificacoes";
import { ListarAvaliacoes, listarTemas, ListarCriterios } from "@/actions/avaliacao";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { InstalarIos } from "@/hooks/instalar-ios";
import { ProvedorTemas } from "@/context/provedor-temas";
import { Prisma } from "../generated/prisma";
import { AppSidebarAssistant } from "@/components/app-sidebar-assistant";
import { ProvedorAssistente } from "@/context/provider-assistente";
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
  const [avaliacoes, temas, criterios] = await Promise.all([
    ListarAvaliacoes(undefined, undefined, 1, 12),
    listarTemas(),
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
        <ProvedorAssistente userId={userId} avaliacoes={avaliacoes} temas={temas} criterios={criterios}>
          <SidebarProvider>
            <AppSidebarAssistant logo={configuracoes.logoSistema} />
            <SidebarInset className="relative">
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster richColors theme="light" />
        </ProvedorAssistente>
      </ProvedorTemas>
    </>
  );
}
