'use client'

import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Ellipsis, FileCheck2 } from "lucide-react"

import { Avaliacao, Tema } from "@/app/generated/prisma"
import { DeletarTema, ListarTemas } from "@/actions/avaliacao"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { DeleteButton } from "./ui/delete-button"
import { FormularioTema } from "./formulario-tema"
import { InputBusca } from "./input-busca"
import { Button } from "./ui/button"

interface TabelaTemasProps {
  temas: Tema[];
  avaliacoes: Avaliacao[];
}

// Componente para agrupar os botões de ação da tabela
function AcoesDoTema({ tema, totalRespostas, aoExcluir }: { tema: Tema; totalRespostas: number; aoExcluir: (id: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Link href={`/professor/avaliacoes/${tema.id}`} passHref>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="hover:cursor-pointer"
              variant={totalRespostas > 0 ? 'default' : 'ghost'}
              disabled={totalRespostas === 0}
            >
              <FileCheck2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-background">
            <p>{totalRespostas} Redações</p>
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
  const respostasPorTema = useMemo(() => {
    const contagem: { [key: number]: number } = {};
    avaliacoes.forEach(avaliacao => {
      if (avaliacao.resposta && avaliacao.temaId) {
        contagem[avaliacao.temaId] = (contagem[avaliacao.temaId] || 0) + 1;
      }
    });
    return contagem;
  }, [avaliacoes]);

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
        <InputBusca placeholder='Buscar por título' />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Data</TableHead>
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
              <TableCell className="w-[54px]">
                <AcoesDoTema
                  tema={tema}
                  totalRespostas={respostasPorTema[tema.id] || 0}
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
