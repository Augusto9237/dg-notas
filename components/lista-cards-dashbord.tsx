'use client'

import { listarAlunosGoogle } from "@/actions/alunos";
import { ListarAvaliacoes, listarTemasMes } from "@/actions/avaliacao";
import { listarMentoriasMes } from "@/actions/mentoria";
import { Prisma } from "@/app/generated/prisma"
import { ContextoProfessor } from "@/context/contexto-professor";
import { calcularMediaGeral } from "@/lib/dashboard-utils";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import { FileType, Users } from "lucide-react";
import { RiUserStarLine } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CardDashboard } from "./card-dashboard";

type Avaliacao = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true,
        criterios: true,
        tema: true,
    }
}>

type Tema = Prisma.TemaGetPayload<{
    include: {
        professor: true
    }
}>

export type Aluno = Prisma.UserGetPayload<{
    include: {
        avaliacoesComoAluno: true,
    }
}>

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        aluno: true,
        horario: {
            include: {
                slot: true
            }
        }
    }
}>

interface ListaCardsDashboardProps {
    avaliacoes: Avaliacao[];
    temas: Tema[];
    mentorias: Mentoria[];
    alunos: Aluno[];
    meses: string[]
}

export function ListaCardsDashboard({ avaliacoes, temas, mentorias, alunos, meses }: ListaCardsDashboardProps) {
    const { notificacoes } = useContext(ContextoProfessor);
    const [listaAvaliacoes, setListaAvaliacoes] = useState<Avaliacao[]>([]);
    const [listaMentorias, setListaMentorias] = useState<Mentoria[]>([]);
    const [listaTemas, setListaTemas] = useState<Tema[]>([]);
    const [listaAlunos, setListaAlunos] = useState<Aluno[]>([]);

    const params = useSearchParams();
    const mes = params.get('mes');
    const ano = params.get('ano')

    useEffect(() => {
        setListaAvaliacoes(avaliacoes);
        setListaMentorias(mentorias);
        setListaTemas(temas);
        setListaAlunos(alunos);
    }, [avaliacoes, mentorias, temas, alunos]);

    useEffect(() => {
        const handleNotification = async () => {
            if (!notificacoes?.data?.url) return;
            const url = notificacoes.data.url;

            if (url === '/professor/avaliacoes') {
                const novasAvaliacoes = await ListarAvaliacoes(Number(mes), Number(ano))
                const novosTemas = await listarTemasMes(Number(mes), Number(ano))

                setListaAvaliacoes(novasAvaliacoes);
                setListaTemas(novosTemas)
            }

            if (url === '/professor/alunos') {
                const novosAlunos = await listarAlunosGoogle()

                setListaAlunos(novosAlunos)
            }

            if (url === '/professor/mentorias') {
                const novasMentorias = await listarMentoriasMes(Number(mes), Number(ano))

                setListaMentorias(novasMentorias)
            }
        }

        handleNotification();
    }, [notificacoes])

    const mediaGeral = calcularMediaGeral(listaAvaliacoes);
    return (
        <div className="grid grid-cols-4 max-[1025px]:grid-cols-2 gap-5 w-full">
            <CardDashboard
                description="Média Geral"
                value={mediaGeral.toFixed(2).replace('.', ',')}
                icon={<FaChartLine size={26} />}
                footerText={`Média geral de ${meses[Number(mes) - 1]}`}
            />

            <CardDashboard
                description="Total de Alunos"
                value={listaAlunos.length}
                icon={<Users size={26} />}
                footerText={`Cadastrados até ${meses[Number(mes) - 1]}`}
            />

            <CardDashboard
                description="Total de Temas"
                value={listaTemas.length}
                icon={<FileType size={26} />}
                footerText={mes && ano ? `Temas de ${meses[Number(mes) - 1]}` : 'Temas do mês atual'}
            />

            <CardDashboard
                description="Total de Mentorias"
                value={listaMentorias.length}
                icon={<RiUserStarLine size={26} />}
                footerText={mes && ano ? `Mentorias de ${meses[Number(mes) - 1]}` : 'Mentorias do mês atual'}
            />
        </div>
    )
}