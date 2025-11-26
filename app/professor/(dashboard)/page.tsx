import { listarAlunosGoogle } from "@/actions/alunos";
import { ListarAvaliacoes, ListarTemas } from "@/actions/avaliacao";
import { listarMentoriasHorario } from "@/actions/mentoria";
import { Avaliacao } from "@/app/generated/prisma";
import { FileType, Users } from "lucide-react";
import { RiUserStarLine } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CardDashboard } from "@/components/card-dashboard";
import { TabelaTopAlunos } from "@/components/tabela-top-alunos";

interface Aluno {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null; // Pode ser null
    createdAt: Date;
    updatedAt: Date;
    role: string | null; // Pode ser null
    banned: boolean | null; // Pode ser null
    banReason: string | null;
    banExpires: Date | null;
    Avaliacao: Avaliacao[];
}

interface AlunoRankeado {
    posicao: number;
    id: string;
    name: string;
    email: string;
    image: string | null; // Pode ser null
    mediaNotas: number;
    totalAvaliacoes: number;
}

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const alunos = await listarAlunosGoogle();
    const temas = await ListarTemas();
    const mentorias = await listarMentoriasHorario();
    const avaliacoes = await ListarAvaliacoes();

    function calcularMediaGeral(avaliacoes: Avaliacao[]): number {
        if (avaliacoes.length === 0) {
            return 0;
        }

        const somaNotas = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.notaFinal, 0);
        const media = somaNotas / avaliacoes.length;

        return media;
    }

    const mediaGeral = calcularMediaGeral(avaliacoes);



    function rankearMelhoresAlunos(alunos: Aluno[], top: number = 10): AlunoRankeado[] {
        // Calcula a média de cada aluno e mapeia para o formato desejado
        const alunosComMedia = alunos
            .map(aluno => {
                const avaliacoes = aluno.Avaliacao || [];

                // Se não tiver avaliações, retorna média 0
                if (avaliacoes.length === 0) {
                    return {
                        id: aluno.id,
                        name: aluno.name,
                        email: aluno.email,
                        image: aluno.image,
                        mediaNotas: 0,
                        totalAvaliacoes: 0
                    };
                }

                // Calcula a média das notas finais
                const somaNotas = avaliacoes.reduce((acc, av) => acc + av.notaFinal, 0);
                const mediaNotas = somaNotas / avaliacoes.length;

                return {
                    id: aluno.id,
                    name: aluno.name,
                    email: aluno.email,
                    image: aluno.image,
                    mediaNotas: Math.round(mediaNotas * 100) / 100, // Arredonda para 2 casas
                    totalAvaliacoes: avaliacoes.length
                };
            })
            // Ordena do maior para o menor (decrescente)
            .sort((a, b) => b.mediaNotas - a.mediaNotas)
            // Pega apenas os N primeiros
            .slice(0, top)
            // Adiciona a posição no ranking
            .map((aluno, index) => ({
                posicao: index + 1,
                ...aluno
            }));

        return alunosComMedia;
    }

    const top10 = rankearMelhoresAlunos(alunos);

    return (
        <div className="w-full">
            <div className='flex justify-between items-center h-14 p-5 mt-3 gap-2 relative'>
                <SidebarTrigger className='absolute' />
                <div className='max-[1025px]:ml-10 overflow-hidden'>
                    <h1 className="text-xl max-sm:text-lg font-bold">Olá,  {session?.user.name}!</h1>
                    <p className="text-xs text-muted-foreground truncate"></p>
                </div>
            </div>
            <main className="flex flex-col gap-4 p-5">
                <div className="grid grid-cols-4 max-[1025px]:grid-cols-2 gap-5 w-full">
                    <CardDashboard
                        description="Média Geral"
                        value={mediaGeral}
                        icon={<FaChartLine size={26} />}
                        footerText="Média geral de todos os alunos"
                    />

                    <CardDashboard
                        description="Total de Alunos"
                        value={alunos.length}
                        icon={<Users size={26} />}
                        footerText="Alunos cadastrados"
                    />

                    <CardDashboard
                        description="Total de Temas"
                        value={temas.length}
                        icon={<FileType size={26} />}
                        footerText="Temas cadastrados"
                    />

                    <CardDashboard
                        description="Total de Mentorias"
                        value={mentorias.length}
                        icon={<RiUserStarLine size={26} />}
                        footerText="Mentorias cadastradas"
                    />
                </div>

                <TabelaTopAlunos alunos={top10} />
            </main>
        </div>
    )
}