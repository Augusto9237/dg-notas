'use client';

import { useParams } from 'next/navigation';
import { students } from '@/lib/data';

export default function AlunoDetalhesPage() {
  const params = useParams();
  const studentId = params.id as string;

  const student = students.find((s) => s.id === studentId);

  if (!student) {
 return (
 <div className="container mx-auto p-4">
        <header className="bg-gray-200 p-4 mb-4">
          <h1 className="text-xl font-bold">Sistema de Notas de Redação</h1>
        </header>
        <h1>Aluno não encontrado</h1>
        <p>Nenhum aluno encontrado com o ID: {studentId}</p>
      </div>
    );
  }

  // Function to calculate total score
  const calculateTotalScore = (competencies: number[]) =>
 competencies.reduce((sum, score) => sum + score, 0);

  return (
 <div className="container mx-auto p-4">
      <header className="bg-gray-200 p-4 mb-4">
 <h1 className="text-xl font-bold">Sistema de Notas de Redação</h1>
 <nav>
 {/* Add navigation links here if needed */}
 </nav>
      </header>

      <h1 className="text-2xl font-bold mb-4">Detalhes de {student.name}</h1>

      <h2 className="text-xl font-semibold mb-2">Redações</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Título da Redação</th>
              <th className="py-2 px-4 border-b">Competência 1</th>
              <th className="py-2 px-4 border-b">Competência 2</th>
              <th className="py-2 px-4 border-b">Competência 3</th>
              <th className="py-2 px-4 border-b">Competência 4</th>
              <th className="py-2 px-4 border-b">Competência 5</th>
              <th className="py-2 px-4 border-b">Nota Total</th>
            </tr>
          </thead>
          <tbody>
            {student.essays.map((essay) => (
              <tr key={essay.id}>
                <td className="py-2 px-4 border-b">{essay.title}</td>
                {essay.competencies.map((score, index) => (
 <td key={index} className="py-2 px-4 border-b">{score}</td>
                ))}
                <td className="py-2 px-4 border-b font-bold">{calculateTotalScore(essay.competencies)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Basic Pagination Control */}
      <div className="flex justify-between items-center mt-4">
        <div>
          {/* Pagination info */}
        </div>
        <div>
          {/* Pagination buttons */}
 <button className="mr-2 p-2 border rounded">&lt;&lt;</button>
 <button className="mr-2 p-2 border rounded">&lt;</button>
 <button className="mr-2 p-2 border rounded">&gt;</button>
 <button className="p-2 border rounded">&gt;&gt;</button>
        </div>
      </div>
    </div>
  );
}
            {essay.competencies.map((score, index) => (
              <li key={index}>Competência {index + 1}: {score} pontos</li>
            ))}
          </ul>
          <p><strong>Nota Total: {essay.competencies.reduce((sum, score) => sum + score, 0)} pontos</strong></p>
        </div>
      ))}
    </div>
  );
}