'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';

interface InputBuscaProps {
    placeholder: string;
}

export function InputBusca({ placeholder }: InputBuscaProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const path = usePathname();
    const buscaUrl = searchParams.get('busca') ?? '';
    const [termoBusca, setTermoBusca] = useState(buscaUrl);

    useEffect(() => {
        setTermoBusca(buscaUrl);
    }, [buscaUrl]);

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set('busca', value); else params.delete('busca');
        params.set('page', '1');
        router.push(`${path}?${params.toString()}`);
    };

    const handleClear = () => {
        setTermoBusca('');
        handleSearch('');
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTermoBusca(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch(termoBusca);
        }
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
                type="button"
                className='absolute right-0 top-0 text-primary border rounded-bl-none rounded-tl-none'
                variant='ghost'
                onClick={() => handleSearch(termoBusca)}
            >
                <Search />
            </Button>
            {termoBusca && (
                <Button
                    type="button"
                    size="icon"
                    className='absolute -right-12 top-0  bg-transparent'
                    variant='ghost'
                    onClick={handleClear}
                >
                    <X />
                </Button>
            )}
        </div>
    );
};
