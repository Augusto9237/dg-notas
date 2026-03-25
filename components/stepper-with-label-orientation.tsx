"use client";

import { defineStepper, Get } from "@stepperize/react";
import { StepStatus, useStepItemContext } from "@stepperize/react/primitives";

import { Button } from "@/components/ui/button";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./kibo-ui/dropzone";
import { useState } from "react";
import Image from "next/image";

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
					variant={isInactive ? "secondary" : "default"}
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

const StepperDescriptionWrapper = ({
	description,
}: { description?: string }) => {
	if (!description) return null;
	return (
		<Stepper.Description
			render={(domProps) => (
				<p className="text-xs text-muted-foreground" {...domProps}>
					{description}
				</p>
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

export function StepperWithLabelOrientation() {
	const [arquivo, setArquivo] = useState<File[] | undefined>();
	const [visualizarArquivo, setVisualizarArquivo] = useState<string | undefined>();

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
	return (
		<Stepper.Root className="w-full space-y-4" orientation="horizontal">
			{({ stepper }) => (
				<>
					<Stepper.List className="flex list-none gap-2 flex-row items-center justify-between">
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
					{stepper.flow.switch({
						"step-1": () => <div>
							<Dropzone
								accept={{ "images": [".jpg", ".jpeg"] }}
								onDrop={handleDrop}
								src={arquivo}
								maxFiles={1}
								className="p-4 flex-1"
							>
								<DropzoneEmptyState />
								<DropzoneContent>
									{visualizarArquivo && (
										<div className="w-full h-auto aspect-[1/1.414]">
											<Image
												className="w-full h-full"
												src={visualizarArquivo}
												alt=""
												width={0}
												height={0}
												sizes="100vw"
											/>
										</div>
									)}
								</DropzoneContent>
							</Dropzone>
						</div>,
						"step-2": (data) => <Content id={data.id} />,
						"step-3": (data) => <Content id={data.id} />,
					})}
					<Stepper.Actions className="flex justify-end gap-4">
						{!stepper.state.isLast && (
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
						)}
						{stepper.state.isLast ? (
							<Button
								type="button"
								onClick={() => stepper.navigation.reset()}
							>
								Reset
							</Button>
						) : (
							<Stepper.Next
								render={(domProps) => (
									<Button type="button" {...domProps}>
										Proximo
									</Button>
								)}
							/>
						)}
					</Stepper.Actions>
				</>
			)}
		</Stepper.Root>
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
