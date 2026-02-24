import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="w-full h-full max-h-screen min-h-screen overflow-hidden">
            <main className="flex flex-col gap-4 p-5 h-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Suas Avaliações</h2>
                </div>
                <div className="space-y-2 max-sm:pb-20">
                    <Skeleton className="w-full h-9" />
                    <div className="flex flex-col gap-4 min-[1025px]:grid min-[1025px]:grid-cols-3">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <Card
                                key={index}
                                className="p-0 min-h-[160px] h-full max-h-[160px] gap-0 relative"
                            >
                                <CardContent className="p-4 relative h-full flex-1 flex flex-col justify-between">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <Skeleton className="w-56 h-6" />
                                        </div>
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                    <div className="flex justify-between w-full pb-10">
                                        <Skeleton className="w-full h-3" />
                                    </div>
                                </CardContent>
                                <CardFooter className="px-4 pb-4 absolute inset-x-0 bottom-0">
                                    <Skeleton className="w-full h-8" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}