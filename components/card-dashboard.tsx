import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ReactNode } from "react";

interface CardDashboardProps {
    description: string;
    value: string | number;
    icon: ReactNode;
    footerText: string;
}

export function CardDashboard({ description, value, icon, footerText }: CardDashboardProps) {
    return (
        <Card>
            <CardHeader>
                <CardDescription>{description}</CardDescription>
                <CardTitle className="text-2xl flex gap-2 items-center font-semibold @[250px]/card:text-3xl">
                    {icon}
                    {value}
                </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {footerText}
                </div>
            </CardFooter>
        </Card>
    );
}
