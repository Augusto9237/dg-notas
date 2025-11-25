'use client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { FileText, Paperclip, Upload } from "lucide-react";

import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { authClient } from "@/lib/auth-client";
import { Tema } from "@/app/generated/prisma";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { EnviarRespoastaAvaliacao } from "@/actions/avaliacao";


const formSchema = z.object({
    username: z.string().min(2).max(50),
})

interface ModalEnviarRedacaoProps {
    tema: Tema;
}


export function ModalEnviarRedacao({ tema }: ModalEnviarRedacaoProps) {
    const { data: session } = authClient.useSession();
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [progress, setProgress] = useState(0)
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

        if (!arquivo || !session?.user?.email || !session?.user?.name) return;

        const storageRef = ref(storage, `avaliacoes/${tema.id}/${session.user.email}`);

        try {
            const res = await uploadBytes(storageRef, arquivo);

            await EnviarRespoastaAvaliacao(
                session.user.id,
                tema.id,
                `avaliacoes/${tema.id}/${session.user.email}`
            )
            toast.success('Redação enviada com sucesso!');
            setArquivo(null);
            setIsOpen(false);

        } catch (error) {
            console.log(error)
            toast.error('Erro! Tente Novamente')
        }
    }

    function cancelar() {
        setArquivo(null);
        setProgress(0);
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
                    <Button type="button" variant="outline" className="min-w-[100px]" onClick={cancelar}>
                        Cancelar
                    </Button>
                    <Button type="button" className="min-w-[100px]" onClick={enviarRespostaExercicio}>
                        Enviar
                    </Button>
                </div>
            </DialogContent >
        </Dialog >
    );
}