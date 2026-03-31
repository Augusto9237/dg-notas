'use client'

import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form"
import { toast } from 'sonner'
import { adicionarInformacoes } from '@/actions/configuracoes'
import { ContextoProfessor } from '@/context/contexto-professor'

// Schema de validação com Zod
const informacoesAppSchema = z.object({
    nomePlataforma: z.string()
        .min(1, 'Nome da plataforma é obrigatório')
        .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    slogan: z.string()
        .max(150, 'Slogan não pode ter mais de 150 caracteres')
        .or(z.literal('')),
    emailContato: z.string()
        .email('Email inválido')
        .min(1, 'Email de suporte é obrigatório'),
    telefone: z.string()
        .min(1, 'Telefone é obrigatório'),
    endereco: z.string()
        .min(1, 'Endereço é obrigatório'),
    sobre: z.string()
        .min(1, 'Descrição do curso é obrigatória')
        .min(10, 'Descrição deve ter no mínimo 10 caracteres')
})

type InformacoesAppFormData = z.infer<typeof informacoesAppSchema>

export default function InformacoesApp() {
    const { configuracoes } = useContext(ContextoProfessor) // Se precisar de dados do contexto, pode desestruturar aqui
    const [isEditMode, setIsEditMode] = useState(false)

    const formulario = useForm<InformacoesAppFormData>({
        resolver: zodResolver(informacoesAppSchema),
        defaultValues: {
            nomePlataforma: configuracoes.nomePlataforma,
            slogan: configuracoes.slogan,
            emailContato: configuracoes.emailContato,
            sobre: configuracoes.sobreCurso,
            telefone: configuracoes.telefone,
            endereco: configuracoes.endereco
        }
    })

    const handleInputFocus = () => {
        setIsEditMode(true)
    }

    const handleCancel = () => {
        formulario.reset()
        setIsEditMode(false)
    }

    const aoEnviar = async (data: InformacoesAppFormData) => {
        try {
            await adicionarInformacoes(
                data.nomePlataforma,
                data.slogan,
                data.emailContato,
                data.telefone,
                data.endereco,
                data.sobre
            )
            toast.success('Informações atualizadas com sucesso!')
            setIsEditMode(false)
            formulario.reset()
        } catch (error) {
            console.error('Erro ao atualizar:', error)
            toast.error('Erro ao atualizar informações')
        }
    }

    const isButtonsDisabled = !isEditMode || !formulario.formState.isDirty

    return (
        <Card className="h-full flex flex-col min-h-fit">
            <CardHeader className="justify-between items-center">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Informações da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-fit flex flex-col">
                <Form {...formulario}>
                    <form onSubmit={formulario.handleSubmit(aoEnviar)} className="flex flex-col flex-1 min-h-0">
                        <div className="flex flex-col flex-1 min-h-0 gap-4 overflow-y-auto">
                            <FormField
                                control={formulario.control}
                                name="nomePlataforma"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Plataforma</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onFocus={handleInputFocus}
                                                className="bg-background"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">Este nome será exibido na página de login e barra de título.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formulario.control}
                                name="slogan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slogan</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onFocus={handleInputFocus}
                                                placeholder="Ex: Excelência em Redação e Linguagens"
                                                className="bg-background"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">Uma frase curta que aparece abaixo do logo.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formulario.control}
                                name="emailContato"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail de Suporte</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onFocus={handleInputFocus}
                                                type="email"
                                                className="bg-background"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">Este e-mail será exibido na página de contato.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formulario.control}
                                name="telefone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const cleanedValue = value.replace(/\D/g, ''); // Remove non-digits
                                                    let formattedValue = '';

                                                    if (cleanedValue.length > 0) {
                                                        formattedValue += `(${cleanedValue.substring(0, 2)}`;
                                                    }
                                                    if (cleanedValue.length > 2) {
                                                        formattedValue += `) ${cleanedValue.substring(2, 7)}`;
                                                    }
                                                    if (cleanedValue.length > 7) {
                                                        formattedValue += `-${cleanedValue.substring(7, 11)}`;
                                                    }
                                                    field.onChange(formattedValue);
                                                }}
                                                onFocus={handleInputFocus}
                                                type="tel"
                                                className="bg-background"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">Este telefone será exibido na página de contato.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formulario.control}
                                name="endereco"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Endereço</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onFocus={handleInputFocus}
                                                className="bg-background"
                                                type="text"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formulario.control}
                                name="sobre"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col flex-1 min-h-0">
                                        <FormLabel>Sobre o Curso</FormLabel>
                                        <FormControl className="flex-1 min-h-0">
                                            <Textarea
                                                {...field}
                                                onFocus={handleInputFocus}
                                                className="bg-background w-full h-full resize-none"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">Descreva um pouco sobre o curso.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-5">
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={isButtonsDisabled}
                                onClick={handleCancel}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant={isEditMode ? 'default' : 'ghost'}
                                type="submit"
                                disabled={isButtonsDisabled || formulario.formState.isSubmitting}
                            >
                                {formulario.formState.isSubmitting ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}