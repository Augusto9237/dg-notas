import Image from "next/image";

export default function Loading() {

    return (
        <div className="w-full flex-1 h-screen flex justify-center items-center">
            <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex size-28 rounded-full border-4 border-primary/80 border-t-transparent animate-spin"></span>
                <Image src="/Símbolo1.svg" alt="logo" height={100} width={100} className="size-24 animate-pulse relative z-10" />
            </div>
        </div>
    )
}