"use client";

import { defineStepper, Get } from "@stepperize/react";
import { StepStatus, useStepItemContext } from "@stepperize/react/primitives";

import { Button } from "@/components/ui/button";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./kibo-ui/dropzone";
import { Dispatch, SetStateAction, useContext, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@/app/generated/prisma";
import { ContextoProfessor } from "@/context/contexto-professor";
import { Card, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { corrigirRedacaoPorImagem } from "@/ia/gemini";
import { Brain, BrainCircuit, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { EditarAvaliacao } from "@/actions/avaliacao";
import { enviarNotificacaoParaUsuario } from "@/actions/notificacoes";
import { Separator } from "./ui/separator";
import clsx from "clsx";
import { Status, StatusIndicator } from "./kibo-ui/status";

const formSchema = z.object({
	tema: z.string().min(1, "Tema é obrigatório"),
	criterios: z.record(z.string(), z.object({
		pontuacao: z.number().min(0).max(200)
	})),
	reposta: z.string().optional(),
	feedback: z.string().optional()
})

type Avaliacao = Prisma.AvaliacaoGetPayload<{
	include: {
		aluno: true,
		criterios: true,
		tema: true,
	}
}>

type FormValues = z.infer<typeof formSchema>

const { Stepper, ...stepperDefinition } = defineStepper(
	{
		id: "step-1",
		title: "Correção",
		description: "Upload do arquivo",
	},
	{
		id: "step-2",
		title: "Pontuaçao",
		description: "Competencias",
	},
	{
		id: "step-3",
		title: "Resumo",
		description: "Configure preferences",
	},
);

const StepperTriggerWrapper = () => {
	const item = useStepItemContext();
	const isInactive = item.status === "inactive";

	return (
		<Stepper.Trigger
			render={(domProps) => (
				<Button
					className="rounded-full"
					variant={isInactive ? "ghost" : "default"}
					size="icon"
					{...domProps}
				>
					<Stepper.Indicator>
						{item.index + 1}
					</Stepper.Indicator>
				</Button>
			)}
		/>
	);
};

const StepperTitleWrapper = ({ title }: { title: string }) => {
	return (
		<Stepper.Title
			render={(domProps) => (
				<h4 className="text-xs font-medium" {...domProps}>
					{title}
				</h4>
			)}
		/>
	);
};


const StepperSeparatorWithLabelOrientation = ({
	status,
	isLast,
}: { status: StepStatus; isLast: boolean }) => {
	if (isLast) return null;

	return (
		<Stepper.Separator
			orientation="horizontal"
			data-status={status}
			className="absolute left-[calc(50%+30px)] right-[calc(-50%+20px)] top-5 block shrink-0 bg-muted data-[status=success]:bg-primary data-[disabled]:opacity-50 transition-all duration-300 ease-in-out h-0.5"
		/>
	);
};

export function StepperWithLabelOrientation({ avaliacao, setIsOpen }: { avaliacao: Avaliacao, setIsOpen: Dispatch<SetStateAction<boolean>> }) {
	const { listaCriterios } = useContext(ContextoProfessor)
	const [arquivo, setArquivo] = useState<File[] | undefined>();
	const [visualizarArquivo, setVisualizarArquivo] = useState<string | undefined>();
	const [precorrigida, setPrecorrigida] = useState(false)
	const [isPending, startTransition] = useTransition()

	useEffect(() => {
		if (!avaliacao.correcao) return;
		const fetchImg = async () => {
			const img = await getDownloadURL(ref(storage, avaliacao.correcao!))
			setVisualizarArquivo(img)
		}
		fetchImg()
	}, [avaliacao])

	const defaultValues = useMemo(() => {
		if (avaliacao) {
			return {
				tema: String(avaliacao.temaId),
				criterios: avaliacao.criterios.reduce((acc, crit) => {
					acc[crit.criterioId] = { pontuacao: crit.pontuacao };
					return acc;
				}, {} as Record<string, { pontuacao: number }>),
				feedback: avaliacao.feedback ?? '',
				reposta: avaliacao.resposta ?? '',
			};
		}
		return {
			tema: "",
			criterios: {},
			reposta: "",
			feedback: ""
		};
	}, [avaliacao]);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues
	})

	const handleDrop = (files: File[]) => {
		setArquivo(files);
		if (files.length > 0) {
			const reader = new FileReader();
			reader.onload = (e) => {
				if (typeof e.target?.result === "string") {
					setVisualizarArquivo(e.target?.result);
				}
			};
			reader.readAsDataURL(files[0]);
		}
	};
	const getGradeColor = (grade: number, maxGrade: number) => {
		const percentage = (grade / maxGrade) * 100;
		if (percentage >= 75) return "bg-primary";
		if (percentage >= 50) return "bg-secondary";
		if (percentage >= 25) return "bg-secondary-foreground";
		return "bg-red-500";
	};

	function correcaoImg() {
		startTransition(async () => {
			try {
				if (!arquivo || arquivo.length === 0 || !visualizarArquivo) return;
				const correcao = await corrigirRedacaoPorImagem(visualizarArquivo, arquivo[0].type, avaliacao.tema.nome)

				const criterios = Object.fromEntries(
					correcao.competencias.map(({ criterioId, pontuacao }) => [criterioId, { pontuacao }])
				) as Record<string, { pontuacao: number }>;

				form.setValue("criterios", criterios)
				form.setValue("feedback", correcao.feedback)
				toast.warning("Redação corrigida com sucesso! Confira a pontuação e o feedback.", {
					icon: <Sparkles />
				})
				setPrecorrigida(true)
			} catch (error) {
				toast.error("Erro ao corrigir redação!")
				console.error(error)
			}
		})
	}

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
				temaId: avaliacao.temaId,
				criterios: criteriosFormatados,
				feedback: values.feedback,
				notaFinal: notaFinal,
				status: 'CORRIGIDA' as const,
			};

			const correcaoUrl = `correcoes/${avaliacao.id}/${avaliacao.aluno.email}_correcao.jpg`;

			if (arquivo) {
				await uploadBytes(storageRef, arquivo[0]);
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

	function cancelar() {
		setIsOpen(false);
		form.reset();
	}

	return (
		<Form {...form}>
			<Stepper.Root className="w-full h-full flex flex-col space-y-4 min-h-0" orientation="horizontal">
				{({ stepper }) => (
					<>
						<Stepper.List className="flex list-none gap-2 flex-row items-center w-full justify-between shrink-0">
							{stepper.state.all.map((stepData, index) => {
								const currentIndex = stepper.state.current.index;
								const status = index < currentIndex ? "success" : index === currentIndex ? "active" : "inactive";
								const isLast = index === stepper.state.all.length - 1;
								const data = stepData as { id: string; title: string; description?: string };
								return (
									<Stepper.Item
										key={stepData.id}
										step={stepData.id}
										className="group peer relative flex w-full flex-col items-center justify-center gap-2"
									>
										<StepperTriggerWrapper />
										<Status status="degraded" className={clsx("absolute top-0 right-12 bg-transparent", !precorrigida && "hidden")}>
											<StatusIndicator />
										</Status>

										<StepperSeparatorWithLabelOrientation
											status={status}
											isLast={isLast}
										/>
										<StepperTitleWrapper
											title={data.title}
										/>
									</Stepper.Item>
								);
							})}
						</Stepper.List>
						<div className="flex-1 min-h-0 flex flex-col">
							{stepper.flow.switch({
								"step-1": () =>
									<div className="flex-1 min-h-0 flex flex-col gap-5">
										<Dropzone
											accept={{ "images": [".jpg", ".jpeg"] }}
											onDrop={handleDrop}
											src={arquivo}
											maxFiles={1}
											className={clsx("p-4 flex-1 flex flex-col min-h-0 relative", isPending && "border-none")}
											disabled={isPending}
										>
											{!arquivo && <DropzoneContent />}
											{!visualizarArquivo && <DropzoneEmptyState />}
											{visualizarArquivo && (
												<div className="relative w-full h-full flex-1 min-h-0">
													<Image
														className="object-contain"
														src={visualizarArquivo}
														alt="Visualização do arquivo"
														fill
														sizes="100vw"
													/>
												</div>
											)}
											<div className={clsx("absolute inset-0 flex items-center justify-center bg-background/80 border-secondary border-2", !isPending && "hidden")}>
												<div className="scanning-line"></div>
												<p className="flex items-center gap-2 text-accent-foreground font-semibold ">
													<Brain />
													Gerando correção, aguarde...
												</p>
											</div>
										</Dropzone>
										<Button
											onClick={correcaoImg}
											disabled={isPending || visualizarArquivo === undefined || !arquivo}
											variant={visualizarArquivo === undefined || !arquivo ? "ghost" : 'secondary'}
										>
											<Sparkles />
											{isPending ? "Corrigindo" : "Pré-correção Automática"}
										</Button>
									</div>,
								"step-2": () =>
									<div className="space-y-4">
										<FormLabel>Competências</FormLabel>
										{listaCriterios.map((criterio, i) => (
											<FormField
												key={criterio.id}
												control={form.control}
												name={`criterios.${criterio.id}.pontuacao`}
												render={({ field }) => {
													const currentValue = field.value || 0;
													return (
														<FormItem >
															<Card className="gap-2 p-4">
																<div className="flex justify-between items-start gap-2">
																	<div className="space-y-1">
																		<FormLabel className="max-sm:text-sm">{i + 1} - {criterio.nome}</FormLabel>
																		<FormDescription className="text-xs">{criterio.descricao}</FormDescription>
																	</div>

																	<FormControl>
																		<Input
																			type="number"
																			className="min-w-16 w-16 px-1.5"
																			value={currentValue}
																			onChange={(e) => field.onChange(Number(e.target.value) || 0)}
																			min={0}
																			max={200}
																		/>
																	</FormControl>

																</div>
																<div className="flex justify-between items-center">
																	<span className="text-xs text-muted-foreground">0</span>
																	<span className="text-xs text-muted-foreground">200</span>
																</div>
																<Progress
																	value={(currentValue / 200) * 100}
																	indicatorClassName={getGradeColor(currentValue, 200)}
																/>
																<FormMessage />
															</Card>
														</FormItem>
													);
												}}
											/>
										))}
									</div>,
								"step-3": () =>
									<div className="flex-1 flex flex-col gap-5 min-h-0">
										<div className="space-y-2 shrink-0">
											<FormLabel>Pontuação</FormLabel>
											<div className="flex flex-col gap-2">
												{Object.entries(form.getValues("criterios")).map(([criterioId, data]) => {
													const criterio = listaCriterios.find((c) => c.id === Number(criterioId));
													return (
														<div key={criterioId} className="flex justify-between items-center border-b border-border py-2">
															<span className="text-sm">{criterio?.nome}</span>
															<span className="text-sm text-muted-foreground">{data.pontuacao}</span>
														</div>
													);
												})}
											</div>
										</div>
										<div className="flex-1 min-h-0 w-full flex flex-col">
											<FormField
												control={form.control}
												name="feedback"
												render={({ field }) => (
													<FormItem className="flex-1 flex flex-col min-h-0">
														<FormLabel className="shrink-0">Feedback</FormLabel>
														<FormControl>
															<Textarea {...field} className="flex-1 min-h-0 w-full resize-none" />
														</FormControl>
														<FormMessage className="shrink-0" />
													</FormItem>
												)}
											/>
										</div>
										<Separator />
										<div className="flex justify-between items-center font-semibold text-lg">
											<span className="">Nota Final:</span>
											<span className="">
												{calcularNotaFinal(form.watch('criterios'))}<span className="text-sm font-normal text-muted-foreground">/1000</span>
											</span>
										</div>
									</div>
							})}
						</div>
						<Stepper.Actions className="grid grid-cols-2 gap-4 pt-4">
							{!stepper.state.isLast ? (
								<Stepper.Prev
									render={(domProps) => (
										<Button
											type="button"
											variant="ghost"
											{...domProps}
										>
											Anterior
										</Button>
									)}
								/>
							) : (
								<Button
									type="button"
									variant="ghost"
									onClick={() => { stepper.navigation.reset(); cancelar(); }}
								>
									Cancelar
								</Button>
							)}
							{stepper.state.isLast ? (
								<Button
									type="button"
									onClick={form.handleSubmit(onSubmit)}
									disabled={form.formState.isSubmitting}
								>
									Salvar
								</Button>
							) : (
								<Stepper.Next
									render={(domProps) => (
										<Button type="button" {...domProps} disabled={isPending}>
											Proximo
										</Button>
									)}
								/>
							)}
						</Stepper.Actions>
					</>
				)}
			</Stepper.Root>
		</Form>
	);
}

const Content = ({ id }: { id: Get.Id<typeof stepperDefinition.steps> }) => {
	return (
		<Stepper.Content
			step={id}
			render={(props) => (
				<div
					{...props}
					className="h-[200px] content-center rounded border bg-secondary text-secondary-foreground p-8"
				>
					<p className="text-xl font-normal">Content for {id}</p>
				</div>
			)}
		/>
	);
};
