'use client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "./ui/button";
import { FileText, Paperclip, Upload } from "lucide-react";

import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useRef, useState } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { authClient } from "@/lib/auth-client";
import { Tema } from "@/app/generated/prisma";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { EnviarRespoastaAvaliacao } from "@/actions/avaliacao";
import { enviarNotificacaoParaUsuario } from "@/actions/notificacoes";
import clsx from "clsx";


interface ModalEnviarRedacaoProps {
    tema: Tema;
}


export function ModalEnviarRedacao({ tema }: ModalEnviarRedacaoProps) {
    const { data: session } = authClient.useSession();
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [carregando, setCarregando] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Referência para o input
    const inputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    function carregarArquivo(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files;
        if (file) {
            setArquivo(file[0]);
        }
    };

    async function enviarRespostaExercicio() {
        setCarregando(true)
        if (!arquivo || !session?.user?.email || !session?.user?.name) return;

        const storageRef = ref(storage, `avaliacoes/${tema.id}/${session.user.email}`);

        try {
            await uploadBytes(storageRef, arquivo);

            await EnviarRespoastaAvaliacao(
                session.user.id,
                tema.id,
                `avaliacoes/${tema.id}/${session.user.email}`
            )
            toast.success('Redação enviada com sucesso!');
            setArquivo(null);
            setIsOpen(false);
            setCarregando(false)
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
    }

    function cancelar() {
        setArquivo(null);
        setCarregando(false);
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

                <Input
                    placeholder="shadcn"
                    type='file'
                    className="hidden"
                    ref={inputRef}
                    onChange={carregarArquivo}
                />
                <Button
                    type="button"
                    onClick={handleButtonClick}
                    variant={arquivo === null ? 'ghost' : 'outline'}
                    className={arquivo === null ? "w-full bg-background border border-accent-foreground" : "w-full bg-primary/10"}
                >
                    {arquivo === null ? (
                        <>
                            <Paperclip />
                            Anexar folha de redação
                        </>
                    ) : (
                        <>
                            <FileText />
                            {arquivo.name}
                        </>
                    )}
                </Button>
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        className={clsx("min-w-[100px]", carregando ? 'hidden' : '')}
                        onClick={cancelar}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        className={clsx("min-w-[100px]", carregando ? 'col-span-2' : '')}
                        disabled={carregando}
                        onClick={enviarRespostaExercicio}
                    >
                        Enviar
                    </Button>
                </div>
            </DialogContent >
        </Dialog >
    );
}