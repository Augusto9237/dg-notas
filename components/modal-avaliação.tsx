'use client'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronRight, Download, FileClock, Loader2, Plus } from "lucide-react"
import { useState } from "react"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Avaliacao, Criterio, CriterioAvaliacao, Prisma } from "@/app/generated/prisma"
import { Card } from "./ui/card"
import { getDownloadURL, ref } from "firebase/storage"
import { storage } from "@/lib/firebase"
import useDownloader from "react-use-downloader";
import { toast } from "sonner"

type AvaliacaoProp = Prisma.AvaliacaoGetPayload<{
  include: {
    tema: true

  };
}>;

interface ModalAvaliacaoProps {
  avaliacao: AvaliacaoProp & { criterios: CriterioAvaliacao[] };
  criterios: Criterio[]
}

export function ModalAvaliacao({ avaliacao, criterios }: ModalAvaliacaoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [carregando, setCarregando] = useState(false)
  const { download } = useDownloader()

  // Verificação de segurança
  if (!avaliacao || !avaliacao.tema) {
    return (
      <Button className="w-full relative bg-primary/10" size="sm" variant="outline" disabled>
        Avaliação Incompleta
      </Button>
    );
  }

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 75) return "bg-primary";
    if (percentage >= 50) return "bg-secondary";
    if (percentage >= 25) return "bg-secondary-foreground";
    return "bg-red-500";
  };

  const getGradeBadgeVariant = (
    grade: number,
    maxGrade: number,
  ) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 75) return "default";
    if (percentage >= 50) return "secondary";
    if (percentage >= 25) return "outline";
    return "destructive";
  };

  async function baixarArquivo(path: string, nomeArquivo: string) {
    setCarregando(true);
    try {
      const arquivo = ref(storage, path);
      const url = await getDownloadURL(arquivo);

      download(url, `${nomeArquivo}.pdf`);
      toast.success('Download iniciado');
    } catch (error) {
      console.error('Erro ao baixar o arquivo:', error);
      toast.error('Erro ao baixar o arquivo. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Dialog open={avaliacao.status === "ENVIADA" ? false : isOpen} onOpenChange={() => setIsOpen(open => !open)}>
      <DialogTrigger asChild>
        <Button className="w-full relative bg-primary/10 dark:bg-primary/10" size="sm" variant="outline" disabled={avaliacao.status === 'ENVIADA'}>
          {avaliacao.status === 'ENVIADA' ?
            <>
              <FileClock />
              <p>Aguardando Correção</p>
            </>
            :
            <>
              <p>Avaliação Completa</p>
              <ChevronRight className="absolute right-3 top-2" />
            </>
          }
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-base mb-2">{avaliacao.tema.nome}</DialogTitle>
        </DialogHeader>
        {avaliacao.criterios.map((criterio) => {
          const criterioInfo = criterios.find(c => c.id === criterio.criterioId);
          if (!criterioInfo) return null;

          return (
            <Card key={criterio.id} className="p-4 gap-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">
                  {criterioInfo.nome}
                </p>
                <Badge
                  className="text-xs"
                  variant={getGradeBadgeVariant(criterio.pontuacao, 200)}
                >
                  {criterio.pontuacao}/200
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{criterioInfo.descricao}</p>
              <Progress value={criterio.pontuacao / 200 * 100} indicatorClassName={getGradeColor(criterio.pontuacao, 200)} />

            </Card>
          );
        })}
        <Separator />
        <div className="flex flex-col justify-between items-center pt-4 gap-4 border-t">
          <div className="flex justify-between font-semibold w-full text-primary dark:text-foreground">
            <span>Nota Final:</span>
            <span>{avaliacao.notaFinal}/1000</span>
          </div>
        </div>

        <Separator className="w-muted" />
        <Button
          onClick={() => baixarArquivo(avaliacao.correcao!, avaliacao.tema.nome)}
        >
          {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download />}
          {carregando ? 'Baixando' : 'Baixar Correção'}
        </Button>

      </DialogContent>
    </Dialog >
  )
}