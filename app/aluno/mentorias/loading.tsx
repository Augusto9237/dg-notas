import Image from "next/image";

export default function Loading() {

    return (
        <div className="w-full h-full flex-1 flex justify-center items-center fixed inset-0">
            <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex size-28 max-md:size-24 rounded-full border-4 border-primary/80 border-t-transparent animate-spin"></span>
                <Image src="/Símbolo1.svg" alt="logo" height={100} width={100} className="size-24 animate-pulse relative z-10" />
            </div>
        </div>
    )
}