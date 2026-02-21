import { obterProfessor } from "@/actions/admin";
import { Avatar } from "@/components/ui/avatar";
import VideoPlayer from "@/components/video-player";
import { ListaVideoaulas } from "@/components/lista-videoaulas";
import Image from "next/image";
import { obterUrlImagem } from "@/lib/obter-imagem";
import { listarVideoaulaPorId } from "@/actions/videoaulas";
import { MenuVideoaulas } from "@/components/menu-videoaulas";
import { notFound } from "next/navigation";
import { MonitorX } from "lucide-react";

export default async function Page({
    params,
}: {
    params: Promise<{ aula: string }>
}) {
    const aulaId = (await params).aula
    const videoaula = await listarVideoaulaPorId(Number(aulaId))
    const professor = await obterProfessor()
    if (!videoaula || !professor) {
        return (
            <div className="flex-1 h-full max-h-screen min-h-screen max-w-screen overflow-hidden p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Aulas</h2>
                </div>

                <main className="flex justify-center flex-1 items-center overflow-hidden h-full">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <MonitorX className="h-10 w-10" />
                        <h1>Nenhuma aula encontrada</h1>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex-1 h-full max-h-screen min-h-screen max-w-screen overflow-x-hidden p-5">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-primary font-semibold">Aulas</h2>
                <div className="sm:hidden">
                    <MenuVideoaulas aulaId={Number(aulaId)} />
                </div>
            </div>

            <main className="flex gap-5 justify-center sm:h-[600px] overflow-hidden">
                <VideoPlayer videoUrl={videoaula.urlVideo} />
                <section className="max-sm:hidden w-sm">
                    <h4 className="mb-4 text-sm leading-none font-semibold">Conteúdos</h4>
                    <ListaVideoaulas aulaId={Number(aulaId)} />
                </section>
            </main>

            <section className="flex flex-col p-5 max-sm:p-0 max-sm:py-5 gap-5">
                <div>
                    <h4 className="font-semibold">{videoaula?.titulo}</h4>
                    <p className="text-xs">{videoaula?.descricao}</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Avatar className="border border-primary">
                        <Image alt={professor?.nome || ''} src={await obterUrlImagem(professor?.image!) || '/avatar-placeholder'} height={40} width={40} className="object-cover" />
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{professor?.nome}</p>
                        <p className="text-xs text-muted-foreground">{professor?.especialidade}</p>
                    </div>
                </div>
            </section>
        </div>
    )
}