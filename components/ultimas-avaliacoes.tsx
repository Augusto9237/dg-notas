import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Prisma, Avaliacao } from "@/app/generated/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type TemasMes = Prisma.TemaGetPayload<{
    include: {
        professor: true,
    }
}>

export function UltimasAvaliacoes({ temasMes, avaliacoes }: { temasMes: TemasMes[]; avaliacoes: Avaliacao[] }) {
    return (
        <Card className="gap-5 p-5 h-full w-full overflow-hidden">
            <CardHeader className="p-0 flex justify-between items-start">
                <CardTitle>Últimas Avaliações</CardTitle>
                <Link href="/professor/avaliacoes" className='flex  items-center text-sm text-primary '>
                    <p className='leading-relaxed max-sm:hidden'>Ver todas</p>
                    <p className='sm:hidden leading-none'>Todas</p>
                    <ChevronRight className="max-sm:size-[16px] size-[20px]" />
                </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden w-full">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-auto">Tema</TableHead>
                            <TableHead className="w-[120px]">Data</TableHead>
                            <TableHead className="w-[100px]">Respostas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {temasMes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                    Nenhuma avaliação encontrada neste mês
                                </TableCell>
                            </TableRow>
                        ) : (
                            temasMes.map((tema) => (
                                <TableRow key={tema.id}>
                                    <TableCell className="max-w-0 truncate">{tema.nome}</TableCell>
                                    <TableCell className="w-[120px]">{format(new Date(tema.createdAt), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="w-[100px] text-center">
                                        <Badge
                                            variant={avaliacoes.filter((avaliacao) => avaliacao.temaId === tema.id && avaliacao.resposta.length > 0).length > 0 ? 'default' : 'outline'}
                                        >
                                            {avaliacoes.filter((avaliacao) => avaliacao.temaId === tema.id && avaliacao.resposta.length > 0).length}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}