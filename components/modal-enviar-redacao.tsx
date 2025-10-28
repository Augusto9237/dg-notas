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
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

import { Check, Download, FileClock, FileDown, FilePenLine, FileText, Paperclip } from "lucide-react";

import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { authClient } from "@/lib/auth-client";
import { Tema } from "@/app/generated/prisma";


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

        const storageRef = ref(storage, `exercicios/${exercicio.id}/${session.user.email}`);

        try {
            const res = await uploadBytes(storageRef, arquivo);

            await enviarResposta({
                resposta: `exercicios/${exercicio.id}/${session.user.email}`,
                emailAluno: session.user.email,
                nomeAluno: session.user.name,
                exercicioId: exercicio.id
            })

            toast.success('Resposta enviada com sucesso!', { theme: 'colored' });
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
                <Button className='h-[56px] uppercase font-semibold' variant={resposta ? 'outline' : 'default'}>
                    {resposta ?
                        <>
                            <Check />
                            Exercício Respondido
                        </>
                        :
                        <>
                            <FilePenLine />
                            Exercícios
                        </>}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle className="text-center">Exercicio</DialogTitle>
                </DialogHeader>
                <div className="space-y-8">
                    <div className="flex flex-col gap-4">
                        <div>
                            <p>Tema</p>
                            <p className="text-sm text-muted-foreground">{exercicio.tema}</p>
                        </div>
                        <div>
                            <p>Descriçao</p>
                            <p className="text-sm text-muted-foreground">{exercicio.descricao}</p>
                        </div>
                    </div >

                    {resposta ? (
                        <div>
                            {resposta.nota !== null && resposta.nota > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Nota</TableHead>
                                            <TableHead className="text-right pr-3">•••</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="px-0">
                                            <TableCell>{resposta.nota}</TableCell>
                                            <TableCell className="text-right pr-0">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="outline" className="z-50 hover:cursor-pointer">
                                                            <FileDown />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-background fill-background">
                                                        <p>Correção</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            ) : (
                                <span className="font-semibold flex gap-2 text-center justify-center">
                                    <FileClock />
                                    Aguardando a correção do Professor
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 items-center">
                            <Button
                                variant="ghost"
                                className="bg-background border border-accent-foreground"
                            >
                                <Download />
                                Baixar folha de redação
                            </Button>
                            <Input
                                placeholder="shadcn"
                                type="file"
                                className="hidden"
                                ref={inputRef}
                                onChange={carregarArquivo}
                            />
                            <Button
                                type="button"
                                onClick={handleButtonClick}
                                variant={arquivo === null ? 'ghost' : 'outline'}
                                className={arquivo === null ? "bg-background border border-accent-foreground" : "bg-primary/10"}
                            >
                                {arquivo === null ? (
                                    <>
                                        <Paperclip />
                                        Anexar folha de redação
                                    </>
                                ) : (
                                    <>
                                        <FileText />
                                        Arquivo carregado
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {resposta ? (
                        <div className="w-full justify-center text-center">
                            <Button type="button" className="min-w-[100px]" onClick={cancelar}>
                                Ok
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center gap-4">
                            <Button type="button" variant="outline" className="min-w-[100px]" onClick={cancelar}>
                                Cancelar
                            </Button>
                            <Button type="button" className="min-w-[100px]" onClick={enviarRespostaExercicio}>
                                Enviar
                            </Button>
                        </div>
                    )
                    }

                </div >
            </DialogContent >
        </Dialog >
    );
}