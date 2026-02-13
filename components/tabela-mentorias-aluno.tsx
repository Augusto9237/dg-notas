'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContextoAluno } from "@/context/contexto-aluno";
import { useContext, useEffect, useState } from "react";
import { CardMentoriaConfirmacao } from "./card-mentoria-confirmacao";
import { ListMentoriasAlunos } from "./lista-mentorias-aluno";
import { DiaSemana, Prisma, SlotHorario } from "@/app/generated/prisma";
import { listarMentoriasAluno } from "@/actions/mentoria";
import { authClient } from "@/lib/auth-client";

type Professor = {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    especialidade: string | null;
    bio: string | null;
    image: string | null;
} | null

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: {
            include: {
                slot: true
            }
        },
        professor: true;
        aluno: true;
    }
}>;

interface ListaMentorias {
    data: Mentoria[]
    meta: {
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

interface TabelaMentoriasAlunoProps {
    professor: Professor;
    diasSemana: DiaSemana[];
    slotsHorario: SlotHorario[];
}

export function TabelaMentoriasAluno({ professor, diasSemana, slotsHorario }: TabelaMentoriasAlunoProps) {
    const { listaMentorias } = useContext(ContextoAluno);
    const [mentorias, setMentorias] = useState<ListaMentorias>({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const { data: session } = authClient.useSession();
    const userId = session?.user.id;

    useEffect(() => {
        // Deduplicar por id para evitar chaves repetidas no React
        const idsVistos = new Set<number>();
        const dataUnica = listaMentorias.data.filter((m) => {
            if (idsVistos.has(m.id)) return false;
            idsVistos.add(m.id);
            return true;
        });
        setMentorias({ ...listaMentorias, data: dataUnica });
        setHasMore(listaMentorias.meta.total > dataUnica.length);
    }, [listaMentorias]);

    const hoje = new Date()
    const brasilTime = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const hojeAno = brasilTime.getFullYear()
    const hojeMes = brasilTime.getMonth()
    const hojeDia = brasilTime.getDate()

    const mentoriasDoDia = mentorias.data.filter((mentoria) => {
        if (mentoria.status !== "AGENDADA" && mentoria.status !== 'CONFIRMADA') return false

        const dataMentoria = new Date(mentoria.horario.data)
        return dataMentoria.getUTCFullYear() === hojeAno &&
            dataMentoria.getUTCMonth() === hojeMes &&
            dataMentoria.getUTCDate() === hojeDia
    })

    const mentoriasAgendadas = mentorias.data.filter((mentoria) => mentoria.status === "AGENDADA");
    const mentoriasRealizadas = mentorias.data.filter((mentoria) => mentoria.status === "REALIZADA");

    // Excluir mentorias já exibidas em "mentorias do dia" para evitar chaves duplicadas e duplicação visual
    const mentoriasAgendadasParaLista = mentoriasAgendadas.filter(
        (m) => !mentoriasDoDia.some((d) => d.id === m.id)
    );

    const nextMentorias = async () => {
        if (loading || !hasMore) return;

        // Verificar se ainda há mais mentorias para carregar
        if (mentorias.data.length >= mentorias.meta.total) {
            setHasMore(false);
            return;
        }

        setLoading(true);

        try {
            // Calcular a próxima página baseada no número atual de mentorias
            const mentoriasCarregadas = mentorias.data.length;
            const proximaPagina = Math.floor(mentoriasCarregadas / mentorias.meta.limit) + 1;
            
            const mentoriasNovas = await listarMentoriasAluno(userId!, proximaPagina, mentorias.meta.limit);
            
            // Adicionar novas mentorias às existentes (deduplicar por id para evitar keys repetidas)
            setMentorias(prev => {
                const idsExistentes = new Set(prev.data.map((m) => m.id));
                const semDuplicatas = mentoriasNovas.data.filter((m) => !idsExistentes.has(m.id));
                const novosData = [...prev.data, ...semDuplicatas];
                const totalCarregado = novosData.length;
                
                // Verificar se ainda há mais mentorias para carregar
                if (totalCarregado >= prev.meta.total || mentoriasNovas.data.length < prev.meta.limit) {
                    setHasMore(false);
                }
                
                return {
                    ...mentoriasNovas,
                    data: novosData,
                    meta: {
                        ...mentoriasNovas.meta,
                        // Manter o total original do primeiro carregamento
                        total: prev.meta.total
                    }
                };
            });
        } catch (error) {
            console.error('Erro ao carregar mais mentorias:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Tabs defaultValue="agendada" className='h-full'>
            <TabsList>
                <TabsTrigger value="agendada" className="text-foreground max-sm:text-xs">Agendadas</TabsTrigger>
                <TabsTrigger value="realizada" className="text-foreground max-sm:text-xs">Realizadas</TabsTrigger>
            </TabsList>
            <TabsContent value="agendada" className="flex flex-col flex-1 h-full gap-4 overflow-y-auto max-sm:pb-24">
                {mentoriasDoDia.length > 0 && (
                    <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
                        {mentoriasDoDia.map((mentoria) => (
                            <CardMentoriaConfirmacao key={mentoria.id} mentoria={mentoria} professor={professor} />
                        ))}
                    </div>
                )}

                <ListMentoriasAlunos
                    mentoriasIniciais={mentoriasAgendadasParaLista}
                    diasSemana={diasSemana}
                    slotsHorario={slotsHorario}
                    professor={professor}
                    hasMore={hasMore}
                    loading={loading}
                    nextMentorias={nextMentorias}
                />
            </TabsContent>
            <TabsContent value="realizada" className="flex flex-col flex-1 h-full overflow-y-auto max-sm:pb-24">
                <ListMentoriasAlunos
                    mentoriasIniciais={mentoriasRealizadas}
                    diasSemana={diasSemana}
                    slotsHorario={slotsHorario}
                    professor={professor}
                    hasMore={hasMore}
                    loading={loading}
                    nextMentorias={nextMentorias}
                />
            </TabsContent>
        </Tabs>

    )
}