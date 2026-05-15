'use client'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


import { Input } from "@/components/ui/input"
import { FilePen, FileText, Loader2, Upload } from "lucide-react"
import { useEffect, useState, useMemo, memo, useRef, useContext } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { EditarAvaliacao } from "@/actions/avaliacao"
import { toast } from "sonner"
import { Criterio, Prisma } from "@/app/generated/prisma"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { ref, uploadBytes } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { enviarNotificacaoParaUsuario } from "@/actions/notificacoes"
import { StepperWithLabelOrientation } from "./stepper-with-label-orientation"

type Avaliacao = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>

const formSchema = z.object({
  tema: z.string().min(1, "Tema é obrigatório"),
  criterios: z.record(z.string(), z.object({
    pontuacao: z.number().min(0).max(200)
  })),
  reposta: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface FormularioAvaliacaoProps {
  avaliacao: Avaliacao
  criterios: Criterio[]
}

export function FormularioCorrecao({ avaliacao, criterios }: FormularioAvaliacaoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null);

  const defaultValues = useMemo(() => {
    if (avaliacao) {
      return {
        tema: String(avaliacao.temaId),
        criterios: avaliacao.criterios.reduce((acc, crit) => {
          acc[crit.criterioId] = { pontuacao: crit.pontuacao };
          return acc;
        }, {} as Record<string, { pontuacao: number }>)
      };
    }
    return {
      tema: "",
      criterios: {},
      reposta: ""
    };
  }, [avaliacao]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  useEffect(() => {
    form.reset(defaultValues);
  }, [avaliacao, form, defaultValues]);

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 75) return "bg-primary";
    if (percentage >= 50) return "bg-secondary";
    if (percentage >= 25) return "bg-secondary-foreground";
    return "bg-red-500";
  };

  const calcularNotaFinal = (criterios: Record<string, { pontuacao: number }>) => {
    return Object.values(criterios || {}).reduce((acc: number, curr: { pontuacao: number }) => acc + (curr?.pontuacao || 0), 0);
  };

  function transformarCriterios(criterios: Record<string, unknown>) {
    return Object.entries(criterios).map(([criterioId, data]) => {
      const criterioData = data as { pontuacao: number };
      return {
        criterioId: Number(criterioId),
        pontuacao: criterioData.pontuacao,
      };
    });
  }

  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  function carregarArquivo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files;
    if (file) {
      setArquivo(file[0]);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const storageRef = ref(storage, `correcoes/${avaliacao.id}/${avaliacao.aluno.email}_correcao.jpg`);
    try {
      if (!values.tema || !values.criterios) {
        throw new Error('Tema e critérios são obrigatórios');
      }

      const criteriosFormatados = transformarCriterios(values.criterios);
      const notaFinal = calcularNotaFinal(values.criterios);

      const dadosAvaliacao = {
        alunoId: avaliacao.alunoId,
        temaId: Number(values.tema),
        criterios: criteriosFormatados,
        notaFinal: notaFinal,
        status: 'CORRIGIDA' as const,
      };

      const correcaoUrl = `correcoes/${avaliacao.id}/${avaliacao.aluno.email}_correcao.jpg`;

      if (arquivo) {
        await uploadBytes(storageRef, arquivo);
      }

      await EditarAvaliacao(avaliacao.id, dadosAvaliacao, correcaoUrl);
      toast.success('Avaliação corrigida com sucesso');

      setIsOpen(false);
      form.reset();
      await enviarNotificacaoParaUsuario(avaliacao.alunoId, 'Correção', `Sua redação foi corrigida! Sua nota final: ${notaFinal}`, `/aluno/avaliacoes`)

    } catch (error) {
      toast.error('Erro ao salvar a avaliação, tente novamente!')
      console.error('Erro ao enviar avaliação:', error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="hover:cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <FilePen />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-background">
            <p>Corrigir</p>
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="flex flex-col h-[96vh]  w-full">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-center">{avaliacao.tema.nome.split(' - ')[0]}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex flex-col mt-2">
          <StepperWithLabelOrientation avaliacao={avaliacao} setIsOpen={setIsOpen} criterios={criterios} />
        </div>
      </DialogContent>
    </Dialog>
  )
};
