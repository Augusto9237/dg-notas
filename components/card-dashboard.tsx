import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ReactNode, Suspense } from "react";
import { Skeleton } from "./ui/skeleton";

interface CardDashboardProps {
    description: string;
    value: string | number;
    icon: ReactNode;
    footerText: string;
}

export function CardSkeleton() {
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
            <Card className="max-sm:gap-3 max-sm:px-5">
                <CardHeader className="max-sm:p-0">
                    <CardDescription className="max-sm:text-xs">{description}</CardDescription>
                    <CardTitle className="text-2xl flex gap-2 items-center font-semibold @[250px]/card:text-3xl">
                        {icon}
                        {value}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm max-sm:p-0">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {footerText}
                    </div>
                </CardFooter>
            </Card>
    );
}
