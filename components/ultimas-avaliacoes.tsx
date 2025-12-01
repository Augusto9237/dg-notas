import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Prisma } from "@/app/generated/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type TemasMes = Prisma.TemaGetPayload<{
    include: {
        Avaliacao: true,
    }
}>[]

export function UltimasAvaliacoes({ temasMes }: { temasMes: TemasMes }) {
    return (
        <Card className="gap-5 p-5 h-full">
            <CardHeader className="p-0 flex justify-between items-start">
                <CardTitle>Últimas Avaliações</CardTitle>
                <Link href="/professor/avaliacoes" className='flex  items-center text-sm text-primary '>
                    <p className='leading-relaxed max-sm:hidden'>Ver todas</p>
                    <p className='sm:hidden'>Todas</p>
                    <ChevronRight className="max-sm:size-[14px]" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tema</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="w-[20px]">Respostas</TableHead>
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
                                    <TableCell>{tema.nome}</TableCell>
                                    <TableCell>{format(new Date(tema.createdAt), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="w-[20px] text-center">
                                        <Badge>
                                            {tema.Avaliacao.filter((avaliacao) => avaliacao.resposta.length > 0).length}
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