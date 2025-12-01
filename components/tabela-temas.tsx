'use client'

import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Ellipsis, FileCheck2 } from "lucide-react"

import { Avaliacao, Tema } from "@/app/generated/prisma"
import { AlterarDisponibilidadeTema, DeletarTema, ListarTemas } from "@/actions/avaliacao"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { DeleteButton } from "./ui/delete-button"
import { FormularioTema } from "./formulario-tema"
import { InputBusca } from "./input-busca"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"

interface respostasPorTema {
  total: number;
  enviadas: number;
}


interface TabelaTemasProps {
  temas: Tema[];
  avaliacoes: Avaliacao[];
}

// Componente para agrupar os botões de ação da tabela
function AcoesDoTema({ tema, totalRespostas, aoExcluir }: { tema: Tema; totalRespostas: respostasPorTema; aoExcluir: (id: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Link href={totalRespostas.total > 0 ? `/professor/avaliacoes/${tema.id}` : '/professor/avaliacoes'} passHref>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="hover:cursor-pointer relative"
              variant={(totalRespostas.total) > 0 ? 'default' : 'ghost'}
              disabled={!totalRespostas?.total}
            >
              {totalRespostas.enviadas > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative flex justify-center items-center size-4 rounded-full bg-card text-[0.60rem] text-center text-primary border border-primary">{totalRespostas.enviadas}</span>
                </span>
              ) : null}
              <FileCheck2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-background">
            <p>Redações</p>
          </TooltipContent>
        </Tooltip>
      </Link>
      <FormularioTema tema={tema} />
      <DeleteButton onClick={() => aoExcluir(tema.id)} />
    </div>
  );
}

export function TabelaTemas({ temas: temasIniciais, avaliacoes }: TabelaTemasProps) {
  const [temas, setTemas] = useState<Tema[]>(temasIniciais);
  const searchParams = useSearchParams();
  const busca = searchParams.get('busca');

  // Efeito para buscar temas quando o parâmetro 'busca' mudar
  useEffect(() => {
    const buscarTemas = async () => {
      if (busca) {
        const resultadoBusca = await ListarTemas(busca);
        setTemas(resultadoBusca);
      } else {
        // Se a busca for removida, volta a exibir os temas iniciais
        setTemas(temasIniciais);
      }
    };

    buscarTemas();
  }, [busca, temasIniciais]);

  // Memoiza a contagem de respostas para cada tema, evitando recálculos desnecessários
  const respostasPorTema = useMemo(() => (temaId: number) => {
    const respostas = avaliacoes.filter(avaliacao => avaliacao.temaId === temaId && avaliacao.resposta);
    return {
      total: respostas.length,
      enviadas: respostas.filter(avaliacao => avaliacao.status === 'ENVIADA').length
    };
  }, [avaliacoes]);

  async function atualizarDisponibilidadeTema(temaId: number, status: boolean) {
    try {
      await AlterarDisponibilidadeTema(temaId, status)
      toast.success('Status do tema atualizado com sucesso')
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  // Função para excluir um tema
  async function excluirTema(id: number) {
    try {
      await DeletarTema(id);
      setTemas(temasAnteriores => temasAnteriores.filter(tema => tema.id !== id));
      toast.success("O tema foi excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir o tema:", error);
      toast.error("Ocorreu um erro ao excluir o tema");
    }
  }

  return (
    <div className='bg-card rounded-lg shadow-sm p-4 flex flex-col gap-4'>
      <div className="flex items-center max-w-md relative">
        <InputBusca placeholder='Buscar por Tema' />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Tema</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-center max-w-[54px]">Disponível</TableHead>
            <TableHead className="text-center max-w-[54px]">
              <div className='flex justify-center w-full'>
                <Ellipsis />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {temas.map((tema) => (
            <TableRow key={tema.id}>
              <TableCell className="w-[54px]">{tema.id}</TableCell>
              <TableCell>{tema.nome}</TableCell>
              <TableCell>{format(new Date(tema.createdAt), "dd/MM/yyyy")}</TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={tema.disponivel}
                  onCheckedChange={(checked) => atualizarDisponibilidadeTema(tema.id, checked)}
                />
              </TableCell>
              <TableCell className="w-[54px]">
                <AcoesDoTema
                  tema={tema}
                  totalRespostas={respostasPorTema(tema.id)}
                  aoExcluir={excluirTema}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
