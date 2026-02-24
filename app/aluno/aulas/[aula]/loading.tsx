import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex-1 h-full max-h-screen min-h-screen max-w-screen overflow-x-hidden p-5">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-primary font-semibold">Aulas</h2>
            </div>

            <main className="flex gap-5 justify-center sm:h-[600px] overflow-hidden">
                <Skeleton className="w-full h-full max-sm:min-h-60" />
                <section className="max-sm:hidden w-sm flex flex-col gap-4">
                    <Skeleton className="h-4 w-60" />
                    <div className="h-full pb-12 flex flex-col gap-2">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div key={index} className="w-full space-y-1">
                                <Skeleton className="h-8 w-full" />
                                <Separator />
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <section className="flex flex-col p-5 max-sm:p-0 max-sm:py-5 gap-5">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-60" />
                    <Skeleton className="h-[12px] w-full" />
                </div>
                <div className="flex gap-2 items-center">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-60" />
                        <Skeleton className="h-[12px] w-60" />
                    </div>
                </div>
            </section>
        </div>
    )
}