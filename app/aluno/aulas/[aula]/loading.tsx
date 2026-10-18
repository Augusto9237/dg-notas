import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="w-full max-w-full flex-1 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="space-y-1">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-5 bg-card rounded-xl border shadow-xs w-full max-w-full overflow-hidden">
                <div className="flex-1 min-w-0 flex items-center justify-center">
                    <Skeleton className="w-full aspect-video" />
                </div>
                <section className="max-sm:hidden w-72 lg:w-80 xl:w-96 shrink-0 flex flex-col p-4 sm:p-5 border-t sm:border-t-0 sm:border-l min-w-0 gap-4">
                    <Skeleton className="h-4 w-28 shrink-0" />
                    <div className="h-full pb-12 flex flex-col gap-2 min-h-[250px]">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="w-full space-y-1">
                                <Skeleton className="h-8 w-full" />
                                <Separator />
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="flex flex-col p-4 sm:p-5 max-sm:px-0 gap-4 sm:gap-5 w-full max-w-full">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-3.5 w-full max-w-xl" />
                </div>
                <div className="flex gap-3 items-center">
                    <Skeleton className="size-10 rounded-full shrink-0" />
                    <div className="space-y-1.5 min-w-0">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                </div>
            </section>
        </div>
    )
}