import { obterProfessor } from "@/actions/admin";
import { Avatar } from "@/components/ui/avatar";
import VideoPlayer from "@/components/video-player";
import { ListaVideoaulas } from "@/components/lista-videoaulas";
import Image from "next/image";
import { obterUrlImagem } from "@/lib/obter-imagem";
import { listarVideoaulaPorId } from "@/actions/videoaulas";
import { MenuVideoaulas } from "@/components/menu-videoaulas";
import { notFound } from "next/navigation";
import { Check, Download, MonitorX } from "lucide-react";
import { Suspense } from "react";
import Loading from "./loading";
import { Button } from "@/components/ui/button";
import { ModalEnviarRedacao } from "@/components/modal-enviar-redacao";
import { listarTemas, listarTemasDisponiveis } from "@/actions/avaliacao";
import { getSessionCached } from "@/lib/session";
import { ModalEnviarExercicio } from "@/components/modal-enviar-exercicio";

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const session = await getSessionCached()
    const aulaId = (await params).slug
    const videoaula = await listarVideoaulaPorId(Number(aulaId))
    const professor = await obterProfessor();

    if (!videoaula || !professor) {
        return (
            <div className="w-full max-w-full flex-1 p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Aulas</h2>
                </div>

                <main className="flex justify-center flex-1 items-center overflow-hidden h-full min-h-[300px]">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <MonitorX className="h-10 w-10" />
                        <h1>Nenhuma aula encontrada</h1>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full h-full min-h-screen max-h-screen flex-1 p-4 sm:p-5 bg-linear-to-bl from-primary/25 via-primary/5 to-primary/0">
                <main className="w-full max-w-7xl mx-auto min-h-0 h-full flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <div className="flex flex-col">
                            <h2 className="text-primary dark:text-primary-foreground font-semibold text-lg sm:text-xl">{`Módulo - ${videoaula.id}`}</h2>
                            <p className='text-primary dark:text-primary-foreground text-xs'>Acompanhe as suas aulas</p>
                        </div>
                        <div className="sm:hidden">
                            <MenuVideoaulas aulaId={Number(aulaId)} />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row bg-card rounded-xl border shadow-xs w-full max-w-full overflow-hidden max-sm:hidden">
                        <div className="flex-1 min-w-0 flex items-center justify-center bg-black/5 dark:bg-black/20">
                            <VideoPlayer videoUrl={videoaula.urlVideo} />
                        </div>
                        <section className="flex flex-col gap-5 min-w-sm sm:max-w-sm w-full overflow-hidden p-5">
                            <h4 className="text-base leading-none font-semibold shrink-0">Conteúdos</h4>
                            <div className="flex-1 min-h-0 min-w-0 overflow-hidden w-fll">
                                <ListaVideoaulas aulaId={Number(aulaId)} />
                            </div>
                        </section>
                    </div>

                    <section className="flex flex-col md:flex-row p-4 max-sm:pt-0 sm:p-5 max-sm:px-0 gap-5 w-full max-w-full bg-card rounded-xl mt-5">
                        <div className="flex-1 min-w-0 flex sm:hidden items-center justify-center bg-black/5 dark:bg-black/20">
                            <VideoPlayer videoUrl={videoaula.urlVideo} />
                        </div>
                        <div className="flex flex-col gap-4 max-sm:px-4 w-full">
                            <div className="min-w-0">
                                <h4 className="font-semibold text-base sm:text-lg break-words break-all">{videoaula?.titulo}</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground break-words break-all mt-1">{videoaula?.descricao}</p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <Avatar className="border border-primary size-10 shrink-0">
                                    <Image alt={videoaula.professor?.name || ''} src={videoaula.professor?.image || "/avatar-placeholder.png"} height={40} width={40} className="object-cover" />
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">{videoaula.professor?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{videoaula.professor?.especialidade}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 sm:max-w-sm w-full overflow-hidden  max-sm:px-5">
                            <div className="flex gap-4 items-center w-full">
                                <Button className="flex-1" variant="outline">
                                    <Download />
                                    Baixar material
                                </Button>
                                <Button variant="ghost" className="flex-1">
                                    <Check />
                                    Marcar como assistida
                                </Button>
                            </div>
                            <div className="w-full flex">
                                <ModalEnviarExercicio videoaulaId={videoaula.id} videoaulaTitulo={videoaula.titulo} professorId={videoaula.professor?.id ?? null} />
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </Suspense>
    )
}