import Image from "next/image";

export default function Loading() {

    return (
        <div className="w-full flex-1 h-screen flex justify-center items-center">
            <Image src="/Símbolo1.svg" alt="logo" height={100} width={100} className="size-28 animate-pulse" />
        </div>
    )
}