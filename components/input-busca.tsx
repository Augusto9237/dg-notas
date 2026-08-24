'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

import { useDebouncedCallback } from 'use-debounce';

interface InputBuscaProps {
    placeholder: string;
}

export function InputBusca({ placeholder }: InputBuscaProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const path = usePathname()
    const buscaUrl = searchParams.get('busca') ?? '';
    const [termoBusca, setTermoBusca] = useState(buscaUrl);

    useEffect(() => {
        setTermoBusca(buscaUrl);
    }, [buscaUrl]);

    const handleSearch = useDebouncedCallback((value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set('busca', value); else params.delete('busca');
        params.set('page', '1');
        router.push(`${path}?${params.toString()}`);
    }, 900);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const novoTermo = event.target.value;
        setTermoBusca(novoTermo);
        handleSearch(novoTermo); // busca ao digitar, com debounce
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') handleSearch.flush(); // dispara na hora, sem duplicar lógica
    };

    return (
        <div className="flex items-center w-full max-w-md relative">
            <Input
                type="text"
                placeholder={placeholder}
                value={termoBusca}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="bg-card/70"
            />
            <Button
                className='absolute right-0 top-0 text-primary border rounded-bl-none rounded-tl-none' variant='ghost'
                onClick={() => handleSearch.flush()}
            >
                <Search />
            </Button>
        </div >
    );
};
