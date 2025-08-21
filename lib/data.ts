import { type } from "os";

export type CompetencyScores = [number, number, number, number, number];

export type Essay = {
  id: string;
  title: string;
  competencies: CompetencyScores;
};

export type Student = {
  id: string;
  name: string;
  essays: Essay[];
};

export const students: Student[] = [
  {
    id: 'student-1',
    name: 'João Silva',
    essays: [
      {
        id: 'essay-1-1',
        title: 'A Importância da Educação',
        competencies: [180, 190, 175, 185, 195],
      },
      {
        id: 'essay-1-2',
        title: 'O Papel da Tecnologia na Sociedade',
        competencies: [190, 185, 180, 190, 188],
      },
    ],
  },
  {
    id: 'student-2',
    name: 'Maria Souza',
    essays: [
      {
        id: 'essay-2-1',
        title: 'Sustentabilidade e Meio Ambiente',
        competencies: [170, 180, 165, 175, 180],
      },
    ],
  },
];