"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { z } from "zod";
import { PencilIcon } from "lucide-react";

export const photoSchema = z.object({
    image: z
        .instanceof(File)
        .refine(
            (file) => file.size <= 5 * 1024 * 1024,
            "Imagem deve ter no máximo 5MB"
        )
        .refine(
            (file) => file.type.startsWith("image/"),
            "Arquivo deve ser uma imagem"
        ),
});

// Placeholder for the server action
async function uploadProfilePhoto(formData: FormData) {
    "use server";
    const validatedFields = photoSchema.safeParse({
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    // Here you would handle the actual image upload to a storage service
    console.log("Image uploaded:", validatedFields.data.image.name);

    return { message: "Success!" };
}


export function FormularioFotoPerfil({ user }: { user: { image?: string | null, name?: string | null } }) {
    const [isOpen, setIsOpen] = useState(false)
    const [preview, setPreview] = useState<string | null>(user.image || null);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleFormAction = async (formData: FormData) => {
        if (!file) return;
        formData.set('image', file);
        const result = await uploadProfilePhoto(formData);
        if (result?.errors) {
            // Handle errors
            console.error(result.errors);
        } else {
            // Handle success
            console.log(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <PencilIcon />
                    <span className="max-sm:hidden">Editar foto</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form action={handleFormAction}>
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={preview || undefined} alt="User profile picture" />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Nova foto</Label>
                            <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <Button type="submit" disabled={!file}>Salvar foto</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
