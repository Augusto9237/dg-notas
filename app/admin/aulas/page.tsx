import { Suspense } from "react";
import Loading from "../(dashboard)/loading";
import { FormularioVideoaula } from "@/components/formulario-videoaula";
import { listarVideoaulas } from "@/actions/videoaulas";
import { TabelaVideoaulas } from "@/components/tabela-videoaulas";
import { HeaderTeacher } from "@/components/header-professor";

export default async function Page() {
  const videoaulas = await listarVideoaulas()

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen relative pt-16 overflow-y-auto">
        <HeaderTeacher title="Aulas" description="Lista de aulas">
          <FormularioVideoaula />
        </HeaderTeacher>

        <main className="flex flex-col p-5 h-full">
          <TabelaVideoaulas videoaulas={videoaulas} />
        </main>
      </div>
    </Suspense>
  );
}