import { ListarAlunosGoogle } from "@/actions/alunos";
import { listarMentoriasHorario } from "@/actions/mentoria";
import { AgendarMentoriaModal } from "@/components/agendar-mentoria-modal";
import { ListaMentorias } from "@/components/lista-mentorias";

enum SlotHorario {
    SLOT_15_00 = "SLOT_15_00",
    SLOT_15_20 = "SLOT_15_20",
    SLOT_15_40 = "SLOT_15_40",
    SLOT_16_00 = "SLOT_16_00",
    SLOT_16_20 = "SLOT_16_20",
    SLOT_16_40 = "SLOT_16_40"
}

export default async function Page() {
     const mentorias  = await listarMentoriasHorario()
     
    return (
        <div className="w-full">
            <div className='flex justify-between items-center h-14 p-5 mt-3'>
                <div className="max-md:pl-10">
                    <h1 className=" text-xl font-bold">Mentorias</h1>
                    <p className="text-xs text-muted-foreground">Lista de mentorias agendadas</p>
                </div>
                <AgendarMentoriaModal />
            </div>
            <ListaMentorias mentoriasIniciais={mentorias} />
        </div>
    )
}