'use client'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Button } from './button';
import { Trash } from 'lucide-react';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    onClick?: () => void;
}

export function DeleteButton({ children, onClick, ...props }: DeleteButtonProps) {

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button size="icon" variant='ghost' className='text-red-500 hover:bg-red-500 hover:text-background' onClick={onClick} {...props}>
                    <Trash />
                </Button>
            </TooltipTrigger>
            <TooltipContent className="text-background bg-red-500 fill-red-500">
                <p>Excluir</p>
            </TooltipContent>
        </Tooltip>
    )
}