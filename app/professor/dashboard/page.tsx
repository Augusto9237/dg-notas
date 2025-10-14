import { ListarAlunosGoogle } from "@/actions/alunos";
import { ListarAvaliacoes, ListarTemas } from "@/actions/avaliacao";
import { listarMentoriasHorario } from "@/actions/mentoria";
import { Avaliacao } from "@/app/generated/prisma";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileType, Users } from "lucide-react";
import { RiUserStarLine } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
    const alunos = await ListarAlunosGoogle();
    const temas = await ListarTemas();
    const mentorias = await listarMentoriasHorario();
    const avaliacoes = await ListarAvaliacoes();

    console.log('alunos', alunos)


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
                    <h1 className="text-xl max-sm:text-lg font-bold">Bem-vindo(a),  {session?.user.name}!</h1>
                    <p className="text-xs text-muted-foreground truncate"></p>
                </div>
            </div>
            <main className="flex flex-col gap-4 p-5">
                <div className="grid grid-cols-4 max-[1025px]:grid-cols-2 gap-5 w-full">
                    <Card className="">
                        <CardHeader>
                            <CardDescription>Média Geral</CardDescription>
                            <CardTitle className="text-2xl flex gap-2 items-center font-semibold  @[250px]/card:text-3xl">
                                <FaChartLine size={26} />
                                {mediaGeral}
                            </CardTitle>

                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Média geral de todos os alunos
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="">
                        <CardHeader>
                            <CardDescription>Total de Alunos</CardDescription>
                            <CardTitle className="text-2xl flex gap-2 items-center font-semibold  @[250px]/card:text-3xl">
                                <Users size={26} />
                                {alunos.length}
                            </CardTitle>

                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Alunos cadastrados
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="">
                        <CardHeader>
                            <CardDescription>Total de Temas</CardDescription>
                            <CardTitle className="text-2xl flex gap-2 items-center font-semibold  @[250px]/card:text-3xl">
                                <FileType size={26} />
                                {temas.length}
                            </CardTitle>

                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Temas cadastrados
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="">
                        <CardHeader>
                            <CardDescription>Total de Mentorias</CardDescription>
                            <CardTitle className="text-2xl flex gap-2 items-center font-semibold  @[250px]/card:text-3xl">
                                <RiUserStarLine size={26} />
                                {mentorias.length}
                            </CardTitle>

                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Mentorias cadastrados
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div>
                    {top10.map((top) => (
                        <div key={top.id}>
                            {top.name}
                            {top.posicao}
                        </div>
                    ))}
                </div>
                <footer>

                </footer>
            </main>
        </div>
    )
}