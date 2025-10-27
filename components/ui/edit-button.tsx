"use client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";

interface EditButtonProps {
    onClick?: () => void;
}

export function EditButton({ onClick}: EditButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="icon"
                    variant='ghost'
                    className="hover:cursor-pointer hover:bg-primary text-primary hover:text-background"
                    onClick={onClick}
                >
                    <Pencil />
                </Button>
            </TooltipTrigger>
            <TooltipContent className="text-background">
                <p>Editar</p>
            </TooltipContent>
        </Tooltip>
    );
}