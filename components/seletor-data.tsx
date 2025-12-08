"use client"

import { format, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useFcmToken from "@/hooks/useFcmToken"


export function SeletorData() {
    const [date, setDate] = useState(new Date())
    const { token, notificationPermissionStatus } = useFcmToken();

    const handleTestNotification = async () => {
        const response = await fetch("/send-notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
                title: "Test Notification",
                message: "This is a test notification",
                link: "/contact",
            }),
        });

        const data = await response.json();
        console.log(data);
    };

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]
    const router = useRouter()

    useEffect(() => {
        router.replace(`?mes=${date.getMonth() + 1}&ano=${date.getFullYear()}`)
    }, [date])

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

    const handleMonthChange = (month: string) => {
        const newDate = setMonth(date, months.indexOf(month))
        setDate(newDate)
    }

    const handleYearChange = (year: string) => {
        const newDate = setYear(date, parseInt(year))
        setDate(newDate)
    }

    return (

        <Button
            disabled={!token}
            className="mt-5"
            onClick={handleTestNotification}
        >
            Send Test Notification
        </Button>
        // <Popover>
        //     <PopoverTrigger asChild>
        //         <Button
        //             variant='ghost'
        //             className={cn(
        //                 "md:w-[200px]  capitalize bg-card hover:bg-card/75 gap-2 ",
        //                 !date && "text-muted-foreground"
        //             )}
        //         >
        //             <CalendarIcon className="h-4 w-4" />
        //             {date ? <span className="max-sm:hidden">{format(date, "MMMM yyyy", { locale: ptBR })}</span> : <span className="max-sm:hidden">Selecione uma data</span>}
        //         </Button>
        //     </PopoverTrigger>
        //     <PopoverContent className="w-auto p-2" align="start">
        //         <div className="flex gap-2">
        //             <Select
        //                 value={months[date.getMonth()]}
        //                 onValueChange={handleMonthChange}
        //             >
        //                 <SelectTrigger className="w-[140px]">
        //                     <SelectValue placeholder="Mês" />
        //                 </SelectTrigger>
        //                 <SelectContent>
        //                     {months.map((month) => (
        //                         <SelectItem key={month} value={month}>
        //                             {month}
        //                         </SelectItem>
        //                     ))}
        //                 </SelectContent>
        //             </Select>
        //             <Select
        //                 value={date.getFullYear().toString()}
        //                 onValueChange={handleYearChange}
        //             >
        //                 <SelectTrigger className="w-[90px]">
        //                     <SelectValue placeholder="Ano" />
        //                 </SelectTrigger>
        //                 <SelectContent>
        //                     {years.map((year) => (
        //                         <SelectItem key={year} value={year.toString()}>
        //                             {year}
        //                         </SelectItem>
        //                     ))}
        //                 </SelectContent>
        //             </Select>
        //         </div>
        //     </PopoverContent>
        // </Popover>
    )
}
