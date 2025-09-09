'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarSync, CalendarX } from "lucide-react";

interface Mentoria {
    id: string
    titulo: string
    data: Date
    professor: string
    status: "agendada" | "concluida" | "cancelada"
}

interface CardMentoriaProps {
    mentoria: Mentoria;
}

export function CardMentoria({ mentoria }: CardMentoriaProps) {
    return (
        <Card className="p-0 gap-2">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Avatar className="border-2 border-primary size-10">
                                <AvatarImage src={"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} />
                                <AvatarFallback>DG</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="font-medium text-sm">Profª {mentoria.professor}</h3>
                                <p className="text-xs text-muted-foreground">
                                    04/09/2025 às 14:00
                                </p>
                            </div>
                        </div>

                    </div>
                    <Badge
                        variant={mentoria.status === "concluida" ? 'default' : 'secondary'}
                    >
                        {mentoria.status}
                    </Badge>
                </div>
            
            </CardContent>

            

            <CardFooter className="p-4 pt-0 gap-5 overflow-hidden grid grid-cols-2">
                <Button size="sm" variant={mentoria.status === 'concluida' ? 'ghost' : "outline"} className="w-full">
                    <CalendarSync />
                    Reagendar
                </Button>
                <Button size="sm" variant={mentoria.status === 'concluida' ? 'ghost' : "destructive"} className="w-full">
                    <CalendarX />
                    Cancelar
                </Button>
            </CardFooter>
        </Card>
    );
}
