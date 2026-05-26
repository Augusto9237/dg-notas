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
import { ContextoAdmin } from "@/context/contexto-admin";

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
    totalAlunos: number;
    meses: string[]
}

export function ListaCardsDashboard({ avaliacoes, temas, mentorias, totalAlunos, meses }: ListaCardsDashboardProps) {
    const { notificacoes } = useContext(ContextoAdmin);
    const [listaAvaliacoes, setListaAvaliacoes] = useState<Avaliacao[]>([]);
    const [listaMentorias, setListaMentorias] = useState<Mentoria[]>([]);
    const [listaTemas, setListaTemas] = useState<Tema[]>([]);
    const [alunos, setAlunos] = useState(0);

    const params = useSearchParams();
    const mes = params.get('mes');
    const ano = params.get('ano')

    // Sincroniza o estado local quando as props do servidor mudam
    // (ex.: navegação com searchParams diferentes)
    useEffect(() => {
        setListaAvaliacoes(avaliacoes);
        setListaMentorias(mentorias);
        setListaTemas(temas);
    }, [avaliacoes, mentorias, temas]);

    useEffect(() => {
        const handleNotification = async () => {
            if (!notificacoes?.data?.url) return;
            const url = notificacoes.data.url;

            if (url === '/admin/avaliacoes') {
                const novasAvaliacoes = await ListarAvaliacoes(Number(mes), Number(ano))
                const novosTemas = await listarTemasMes(Number(mes), Number(ano))

                setListaAvaliacoes(novasAvaliacoes.data);
                setListaTemas(novosTemas)
            }

            if (url === '/admin/alunos') {
                const { total } = await listarAlunosGoogle()
                setAlunos(total)
            }

            if (url === '/admin/mentorias') {
                const novasMentorias = await listarMentoriasMes(Number(mes), Number(ano))

                setListaMentorias(novasMentorias)
            }
        }

        handleNotification();
    }, [notificacoes])

    // Determina o mês exibido no rodapé: usa searchParams se disponível,
    // caso contrário mostra o mês atual (mesmo comportamento das actions no servidor)
    const mesExibido = mes ?? String(new Date().getMonth() + 1);
    const mediaGeral = calcularMediaGeral(listaAvaliacoes.filter(av => av.status === "CORRIGIDA"));

    return (
        <div className="grid grid-cols-4 max-[1025px]:grid-cols-2 gap-5 w-full">
            <CardDashboard
                description="Média Geral"
                value={mediaGeral.toFixed(2).replace('.', ',')}
                icon={<FaChartLine className="size-5" />}
                footerText={`Média geral de ${meses[Number(mesExibido) - 1]}`}
            />

            <CardDashboard
                description="Alunos"
                value={totalAlunos}
                icon={<Users className="size-5" />}
                footerText={`Matriculados`}
            />

            <CardDashboard
                description="Temas"
                value={listaTemas.length}
                icon={<FileType className="size-5" />}
                footerText={mes && ano ? `Temas de ${meses[Number(mes) - 1]}` : 'Temas do mês atual'}
            />

            <CardDashboard
                description="Mentorias"
                value={listaMentorias.length}
                icon={<RiUserStarLine className="size-5" />}
                footerText={mes && ano ? `Mentorias de ${meses[Number(mes) - 1]}` : 'Mentorias do mês atual'}
            />
        </div>
    )
}