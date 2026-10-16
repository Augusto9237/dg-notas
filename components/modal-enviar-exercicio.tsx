'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "./ui/button";
import { FileUp } from "lucide-react";
import { useState, useTransition } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { enviarNotificacaoParaUsuario } from "@/actions/notificacoes";
import clsx from "clsx";
import Image from "next/image";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./kibo-ui/dropzone";
import { Spinner } from "./ui/spinner";

interface ModalEnviarExercicioProps {
    videoaulaId: number;
    videoaulaTitulo: string;
    professorId: string | null;
}

export function ModalEnviarExercicio({
    videoaulaId,
    videoaulaTitulo,
    professorId,
}: ModalEnviarExercicioProps) {
    const { data: session } = authClient.useSession();
    const [arquivo, setArquivo] = useState<File[] | undefined>();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [visualizarArquivo, setVisualizarArquivo] = useState<string | undefined>();

    const handleDrop = (files: File[]) => {
        setArquivo(files);
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === "string") {
                    setVisualizarArquivo(e.target.result);
                }
            };
            reader.readAsDataURL(files[0]);
        }
    };

    function enviarExercicio() {
        startTransition(async () => {
            if (!arquivo?.length || !session?.user?.email || !session?.user?.name) return;

            const storagePath = `exercicios/${videoaulaId}/${session.user.email}`;
            const storageRef = ref(storage, storagePath);

            try {
                await uploadBytes(storageRef, arquivo[0]);

                toast.success('Exercício enviado com sucesso!');
                setArquivo(undefined);
                setVisualizarArquivo(undefined);
                setIsOpen(false);

                if (professorId) {
                    await enviarNotificacaoParaUsuario(
                        professorId,
                        'Novo exercício recebido!',
                        `${session.user.name} enviou um exercício da aula "${videoaulaTitulo}".`,
                        '/professor/avaliacoes'
                    );
                }
            } catch (error) {
                console.error(error);
                toast.error('Erro ao enviar. Tente novamente.');
            }
        });
    }

    function cancelar() {
        setArquivo(undefined);
        setVisualizarArquivo(undefined);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) cancelar();
            else setIsOpen(true);
        }}>
            <DialogTrigger asChild>
                <Button className="w-full" size="default" variant="default">
                    <FileUp />
                    Enviar Exercício
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle className="text-center">Enviar Exercício</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col w-full overflow-hidden">
                    <div className="w-full overflow-hidden">
                        <Label>Aula</Label>
                        <p className="text-sm text-muted-foreground truncate w-full">{videoaulaTitulo}</p>
                    </div>
                </div>

                <Dropzone
                    accept={{ "images": [".jpg", ".jpeg", ".png", ".pdf"] }}
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
                                    className="w-full h-full object-contain"
                                    src={visualizarArquivo}
                                    alt="Prévia do exercício"
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
                        onClick={cancelar}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        className={clsx("min-w-[100px]", isPending ? 'col-span-2' : '')}
                        disabled={isPending || !arquivo?.length}
                        onClick={enviarExercicio}
                    >
                        {isPending && <Spinner />}
                        {isPending ? 'Enviando...' : 'Enviar'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
