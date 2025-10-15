import Image from "next/image";

export default function Loading2() {

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center bg-primary animate-fade animate-once animate-ease-linear">
            <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex size-28 max-md:size-24 rounded-full border-4 border-background border-t-transparent animate-spin"></span>
                <Image src="/Símbolo6.svg" alt="logo" height={100} width={100} className="size-24 max-md:size-22 animate-pulse relative z-10" />
            </div>
        </div>
    )
}