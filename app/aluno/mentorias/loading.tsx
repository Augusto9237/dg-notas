import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {

    return (
        <div className="w-full h-full max-h-screen min-h-screen overflow-hidden">
            <main className="flex flex-col gap-4 p-5 pb-20 h-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Suas Mentorias</h2>
                </div>
                <Skeleton className="rounded-full fixed bottom-20 right-5 size-12 shadow-md" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="w-full h-9" />
                    <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <Card key={index} className="p-0 gap-2">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="size-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 gap-5 overflow-hidden grid grid-cols-2 w-full">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}