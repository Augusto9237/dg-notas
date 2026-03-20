import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ReactNode, Suspense } from "react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

interface CardDashboardProps {
    description: string;
    value: string | number;
    icon: ReactNode;
    footerText: string;
}

export const CardSkeleton = () => {
    return (
        <Card className="max-sm:gap-3 max-sm:px-5">
            <CardHeader className="max-sm:p-0">
                <Skeleton className="h-[14px] max-sm:h-[12px] w-full" />
                <div className="text-2xl flex gap-2 items-center font-semibold @[250px]/card:text-3xl">
                    <Skeleton className="size-[26px] rounded-full" />
                    <Skeleton className="w-full h-[24px]" />
                </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm max-sm:p-0">
                <Skeleton className="w-full h-[14px]" />
            </CardFooter>
        </Card>
    )
}

export function CardDashboard({ description, value, icon, footerText }: CardDashboardProps) {
    return (
        <Card className="max-sm:gap-3 max-sm:px-5 max-h-[150px]">
            <CardHeader className="max-sm:p-0 relative w-full">
                <CardDescription className="max-sm:text-xs text-sm">{description}</CardDescription>
                <CardTitle className="text-2xl flex gap-2 items-center font-semibold @[250px]/card:text-3xl">
                    {value}
                </CardTitle>
                <div className="bg-primary-foreground/5 absolute right-5 max-sm:right-0 size-8 rounded-sm text-primary flex justify-center items-center">{icon}</div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm max-sm:p-0">
                <Badge variant="outline">
                    {footerText}
                </Badge>
            </CardFooter>
        </Card>
    );
}
