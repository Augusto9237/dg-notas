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
import { ProvedorAdmin } from "@/context/provider-admin";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { InstalarIos } from "@/hooks/instalar-ios";
import { ProvedorTemas } from "@/context/provedor-temas";
import { Prisma } from "../generated/prisma";
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
        <ProvedorAdmin configuracoes={configuracoes} userId={userId}>
          <SidebarProvider>
            <AppSidebar logo={configuracoes.logoSistema} />
            <SidebarInset className="relative">
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster richColors theme="light" />
        </ProvedorAdmin>
      </ProvedorTemas>
    </>
  );
}
