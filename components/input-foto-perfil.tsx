"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardTitle,
} from "@/components/ui/card"
import { PencilIcon } from "lucide-react"

import React, { useRef, useState } from "react"

interface Professor {
    name: string
    especialidade: string
    image?: string | null
}

interface InputFotoPerfilProps {
    professor: Professor | null
    fotoPerfil: string | null
    onFileChange: (file: File) => void
    onFileUpload: () => void
    isUploading: boolean
}

export default function InputFotoPerfil({
    professor,
    fotoPerfil,
    onFileChange,
    onFileUpload,
    isUploading,
}: InputFotoPerfilProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
            onFileChange(file)
        }
    }

    const handleIconClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <Card className="w-full items-center">
            <div className="flex flex-col items-center gap-4 justify-center flex-1 p-6 relative">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                <div className="relative group">
                    <Avatar className="size-56 min-[1025px]:size-64 border-2 border-primary">
                        <AvatarImage
                            src={previewUrl || fotoPerfil || ''}
                            alt={professor?.name || 'Avatar'}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-xs">
                            {professor?.name
                                .split(" ")
                                .map(word => word.charAt(0))
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                        onClick={handleIconClick}
                    >
                        <PencilIcon className="text-white h-12 w-12" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <CardTitle className="text-primary">
                        {professor?.name}
                    </CardTitle>
                    <Badge variant={'secondary'}>
                        {professor?.especialidade}
                    </Badge>
                </div>
                {previewUrl && (
                    <Button
                        onClick={onFileUpload}
                        disabled={isUploading}
                        className="w-full"
                    >
                        {isUploading ? 'Enviando...' : 'Salvar foto'}
                    </Button>
                )}
            </div>
        </Card>
    )
}