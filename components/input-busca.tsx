'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

interface InputBuscaProps {
    placeholder: string;
}

export function InputBusca({ placeholder }: InputBuscaProps) {
    const [termoBusca, setTermoBusca] = useState('');
    const searchParams = useSearchParams()
    const router = useRouter()
    const path = usePathname()
    const busca = searchParams.get('busca')


    useEffect(() => {
        if (busca && typeof busca === 'string') {
            setTermoBusca(busca);
        }
    }, [busca]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const novoTermo = event.target.value;
        setTermoBusca(novoTermo);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            router.replace(`?busca=${termoBusca}`)
        }
    };

    function handleSearch() {
        router.replace(`?busca=${termoBusca}`)
    }

    return (
        <div className="flex items-center w-full max-w-md relative">
            <Input
                type="text"
                placeholder={placeholder}
                value={termoBusca}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="bg-card/70"
            />
            <Button
                className='absolute right-0 top-0 text-primary border rounded-bl-none rounded-tl-none' variant='ghost'
                onClick={handleSearch}
            >
                <Search />
            </Button>
        </div >
    );
};
