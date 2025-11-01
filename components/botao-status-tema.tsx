'use client'

import { Check, ChevronDownIcon, Clock } from "lucide-react"
import { Button } from "./ui/button"
import { ButtonGroup } from "./ui/button-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Tema } from "@/app/generated/prisma"
import { AlterarDisponibilidadeTema } from "@/actions/avaliacao"
import { toast } from "sonner"

interface BotaoStatusTemaProps {
    tema: Tema
}
export default function BotaoStatusTema({ tema }: BotaoStatusTemaProps) {

    async function atualizarStatusDaMentoria(status: boolean) {
        try {
            await AlterarDisponibilidadeTema(tema.id, status)
            toast.success('Status do tema atualizado com sucesso')
        } catch {
            toast.error('Erro ao atualizar status')
        }
    }
    return (
        <ButtonGroup>
            <Button
                variant={tema.disponivel === true ? 'secondary' : 'default'}
            >
                {tema.disponivel === true ? <Clock className="" /> : <Check className="" />}
                <p className="max-[1025px]:hidden">
                    {tema.disponivel === true ? 'Disponível' : 'Finalizado'}
                </p>

            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={tema.disponivel === true ? 'secondary' : 'default'}
                        className="!pl-2"
                    >
                        <ChevronDownIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align='end'
                    className="space-y-4 p-2 flex flex-col w-[158px]"
                    sideOffset={0}
                >
                    <Button
                        variant='secondary'
                    onClick={() => atualizarStatusDaMentoria(true)}
                    >
                        <Clock />
                        Disponível
                    </Button>

                    <Button
                    onClick={() => atualizarStatusDaMentoria(false)}
                    >
                        <Check />
                        Finalizado
                    </Button>
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    )
}