import { ListarAlunosGoogle } from "@/actions/alunos";
import { ListarAvaliacoes, ListarTemas } from "@/actions/avaliacao";
import { listarMentoriasHorario } from "@/actions/mentoria";
import { Avaliacao } from "@/app/generated/prisma";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileType, Users } from "lucide-react";
import { RiUserStarLine } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa";

export default async function Page() {
    const alunos = await ListarAlunosGoogle();
    const temas = await ListarTemas();
    const mentorias = await listarMentoriasHorario();
    const avaliacoes = await ListarAvaliacoes()


    function calcularMediaGeral(avaliacoes: Avaliacao[]): number {
        if (avaliacoes.length === 0) {
            return 0;
        }

        const somaNotas = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.notaFinal, 0);
        const media = somaNotas / avaliacoes.length;

        return media;
    }

    const mediaGeral = calcularMediaGeral(avaliacoes)
    return (
        <main className="flex flex-col p-5">
            <header className="grid grid-cols-4 gap-5">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Média Geral</CardDescription>
                        <CardTitle className="text-2xl flex gap-2 items-center font-semibold tabular-nums @[250px]/card:text-3xl">
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

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total de Alunos</CardDescription>
                        <CardTitle className="text-2xl flex gap-2 items-center font-semibold tabular-nums @[250px]/card:text-3xl">
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

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total de Temas</CardDescription>
                        <CardTitle className="text-2xl flex gap-2 items-center font-semibold tabular-nums @[250px]/card:text-3xl">
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

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total de Mentorias</CardDescription>
                        <CardTitle className="text-2xl flex gap-2 items-center font-semibold tabular-nums @[250px]/card:text-3xl">
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
            </header>
            <footer>

            </footer>
        </main>
    )
}