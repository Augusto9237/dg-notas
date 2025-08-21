import Link from 'next/link';
import { students } from '@/lib/data';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import StudentsTable from '@/components/StudentsTable';

export default function Home() {
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <main className="p-4 flex flex-col gap-4">
        <h1 className=" text-xl font-bold">Alunos</h1>

        {/* Filter/Search Area */}
        <div className="flex items-center gap-4 max-w-sm">
          {/* Placeholder filter inputs and buttons */}
          <Input type="text" placeholder="Buscar por nome..." className="filter-input" />
          <button className="filter-button">Buscar</button>
        </div>

        {/* Students Table */}
        <StudentsTable />

        {/* Pagination Control Area */}
        <div className="pagination-area"></div>
      </main>
    </div>
  );
}
