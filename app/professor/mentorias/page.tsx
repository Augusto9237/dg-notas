import { ListarAlunosGoogle } from "@/actions/alunos";
import { AgendarMentoriaModal } from "@/components/agendar-mentoria-modal";
import { ListaMentorias } from "@/components/lista-mentorias";


export default async function Page() {
     const alunos = await ListarAlunosGoogle()
     
    return (
        <div className="w-full">
            <div className='flex justify-between items-center h-14 p-5 mt-3'>
                <div className="max-md:pl-10">
                    <h1 className=" text-xl font-bold">Mentorias</h1>
                    <p className="text-xs text-muted-foreground">Lista de mentorias agendadas</p>
                </div>
                <AgendarMentoriaModal />
            </div>
            <ListaMentorias />
        </div>
    )
}