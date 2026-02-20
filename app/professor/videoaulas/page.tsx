import { Suspense } from "react";
import Loading from "../(dashboard)/loading";
import { HeaderProfessor } from "@/components/header-professor";
import { FormularioVideoaula } from "@/components/formulario-videoaula";
import { listarVideoaulas } from "@/actions/videoaulas";
import { TabelaVideoaulas } from "@/components/tabela-videoaulas";

export default async function Page() {
  const videoaulas = await listarVideoaulas()
   
    return (
      <Suspense fallback={<Loading />}>
        <div className="w-full h-full min-h-screen relative pt-14 overflow-y-auto">
          <HeaderProfessor>
            <div>
              <h1 className=" text-xl font-bold">Videoaulas</h1>
              <p className="text-xs text-muted-foreground max-sm:leading-none">Lista de videoaulas</p>
            </div>
            <div className='flex justify-end w-full flex-1 items-center gap-4'>
              <FormularioVideoaula/>
            </div>
          </HeaderProfessor>
  
          <main className="flex flex-col p-5 h-full">
            <TabelaVideoaulas videoaulas={videoaulas}/>
          </main>
        </div>
      </Suspense>
    );
  }