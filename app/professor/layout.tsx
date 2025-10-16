import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "../globals.css";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect, unauthorized } from "next/navigation";
import { Toaster } from "sonner";

const poppins = Poppins({
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'], // Specify the weights you need
  subsets: ['latin'],
  display: 'swap', // Or 'fallback' or 'optional'
});


export const metadata: Metadata = {
  title: "DG - Curso de Redação - Professor",
  description: 'Plataforma de correção de redações e agendamento de mentorias',
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

  if (session.user.role !== 'professor') {
    await auth.api.signOut({
      headers: await headers()
    })
    redirect('/')
  }

  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.className} antialiased`}
      >
        <SidebarProvider>
          <div suppressHydrationWarning>
            <AppSidebar />
          </div>
          <SidebarInset>
            <div className="realtive">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster richColors theme="light"/>
      </body>
    </html>
  );
}
