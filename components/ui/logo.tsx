import Image from 'next/image';
import React from 'react';
import logoGrande from '../../public/Sublogo4.svg';
import logoPequeno from '../../public/Logo1.svg';

interface LogoProps {
    alt?: string;
    grande?: {
        width: number;
        height: number;
    };
    pequeno?: {
        width: number;
        height: number;
    }
}

export function Logo({
    alt = 'Logo',
    grande = {
        width: 440,
        height: 220,
    },
    pequeno = {
        width: 34,
        height: 34,
    }
}: LogoProps) {
    return (
        <>
            <Image
                src={logoGrande}
                alt={alt}
                width={grande.width}
                height={grande.height}
                priority
                className='w-52 h-12 object-cover max-md:hidden'
            />
            <Image
                src={logoPequeno}
                alt={alt}
                width={34}
                height={34}
                priority
                className='w-20 h-12 object-cover md:hidden'
            />
        </>
    )
};