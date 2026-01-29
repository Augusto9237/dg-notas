'use client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { useState, useTransition } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { authClient } from "@/lib/auth-client";
import { Tema } from "@/app/generated/prisma";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { EnviarRespoastaAvaliacao } from "@/actions/avaliacao";
import { enviarNotificacaoParaUsuario } from "@/actions/notificacoes";
import clsx from "clsx";
import Image from "next/image";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./kibo-ui/dropzone";
import { Spinner } from "./ui/spinner";

interface ModalEnviarRedacaoProps {
    tema: Tema;
}

export function ModalEnviarRedacao({ tema }: ModalEnviarRedacaoProps) {
    const { data: session } = authClient.useSession();
    const [arquivo, setArquivo] = useState<File[] | undefined>();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false)
    const [visualizarArquivo, setVisualizarArquivo] = useState<string | undefined>();

    const handleDrop = (files: File[]) => {
        setArquivo(files);
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === "string") {
                    setVisualizarArquivo(e.target?.result);
                }
            };
            reader.readAsDataURL(files[0]);
        }
    };

    function enviarRespostaExercicio() {
        startTransition(async () => {
            if (arquivo === undefined || !session?.user?.email || !session?.user?.name) return;

            const storageRef = ref(storage, `avaliacoes/${tema.id}/${session.user.email}`);

            try {
                await uploadBytes(storageRef, arquivo[0]);

                await EnviarRespoastaAvaliacao(
                    session.user.id,
                    tema.professorId,
                    tema.id,
                    `avaliacoes/${tema.id}/${session.user.email}`
                )
                toast.success('Redação enviada com sucesso!');
                setArquivo(undefined);
                setIsOpen(false);
                await enviarNotificacaoParaUsuario(
                    tema.professorId,
                    'Nova redação recebida!',
                    `Uma redação sobre o tema "${tema.nome}" foi recebida!`,
                    '/professor/avaliacoes'
                )

            } catch (error) {
                console.log(error)
                toast.error('Erro! Tente Novamente')
            }
        })
    }

    function cancelar() {
        setArquivo(undefined);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => setIsOpen(open => !open)}>
            <DialogTrigger asChild>
                <Button className="w-full" size='sm'>
                    <Upload />
                    Enviar Redação
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle className="text-center">Enviar Redação</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-5">
                    <div>
                        <Label>Tema</Label>
                        <p className="text-sm text-muted-foreground">{tema.nome}</p>
                    </div>
                </div >
                <Dropzone
                    accept={{ "images": [".jpg", ".jpeg"] }}
                    onDrop={handleDrop}
                    onError={() => toast.error('Formato de arquivo não suportado!')}
                    src={arquivo}
                    maxFiles={1}
                    className="p-4"
                >
                    <DropzoneEmptyState />
                    <DropzoneContent>
                        {visualizarArquivo && (
                            <div className="w-full h-full aspect-[1/1.414]">
                                <Image
                                    className="w-full h-full"
                                    src={visualizarArquivo}
                                    alt=""
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                />
                            </div>
                        )}
                    </DropzoneContent>
                </Dropzone>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        className={clsx("min-w-[100px]", isPending ? 'hidden' : '')}
                        onClick={cancelar}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        className={clsx("min-w-[100px]", isPending ? 'col-span-2' : '')}
                        disabled={isPending}
                        onClick={enviarRespostaExercicio}
                    >
                        {isPending && <Spinner />}
                        {isPending ? 'Enviando' : 'Enviar'}
                    </Button>
                </div>
            </DialogContent >
        </Dialog >
    );
}