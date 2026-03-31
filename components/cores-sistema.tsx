import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CoresSistema() {
    return (
        <div className="col-span-3 flex flex-col">
            <Card className="h-full flex flex-col min-h-0">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Cores do Tema</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto min-h-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Azul Imperial */}
                        <button className="p-4 border-2 border-primary rounded-xl bg-card hover:bg-accent transition cursor-pointer" >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600"></div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm">Azul Imperial</p>
                                    <p className="text-xs text-muted-foreground">Esquema oficial padrão</p>
                                </div>
                                <div className="ml-auto">
                                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {/* Esmeralda Soft */}
                        <button className="p-4 border-2 border-muted rounded-xl bg-card hover:bg-accent transition cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-600"></div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm">Esmeralda Soft</p>
                                    <p className="text-xs text-muted-foreground">Tom profissional e calmo</p>
                                </div>
                            </div>
                        </button>

                        {/* Roxo Acadêmico */}
                        <button className="p-4 border-2 border-muted rounded-xl bg-card hover:bg-accent transition cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-600"></div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm">Roxo Acadêmico</p>
                                    <p className="text-xs text-muted-foreground">Focado em criatividade</p>
                                </div>
                            </div>
                        </button>

                        {/* Modo Escuro */}
                        <button className="p-4 border-2 border-muted rounded-xl bg-card hover:bg-accent transition cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800"></div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm">Modo Escuro</p>
                                    <p className="text-xs text-muted-foreground">Alternnar interface para cores escuras</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}