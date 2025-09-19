"use server";

import { Mentoria } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Tipos para os parâmetros da função
interface AdicionarMentoriaParams {
  alunoId: string;
  data: Date;
  slot: SlotHorario;
  duracao?: number; // Opcional, padrão 20 minutos
}

// Tipo de retorno da função
interface AdicionarMentoriaResult {
  success: boolean;
  mentoria?: Mentoria;
  error?: string;
}

// Enums (assumindo que estão definidos em outro lugar)
enum SlotHorario {
  SLOT_15_00 = 'SLOT_15_00',
  SLOT_15_20 = 'SLOT_15_20',
  SLOT_15_40 = 'SLOT_15_40',
  SLOT_16_00 = 'SLOT_16_00',
  SLOT_16_20 = 'SLOT_16_20',
  SLOT_16_40 = 'SLOT_16_40'
}

enum StatusHorario {
  OCUPADO = 'OCUPADO',
  LIVRE = 'LIVRE'
}

enum StatusMentoria {
  AGENDADA = 'AGENDADA',
  CANCELADA = 'CANCELADA',
  REALIZADA = 'REALIZADA'
}

/**
 * Adiciona uma nova mentoria para um aluno em um horário específico
 * @param params - Parâmetros necessários para criar a mentoria
 * @returns Resultado da operação com a mentoria criada ou erro
 */
export async function adicionarMentoria(
  params: AdicionarMentoriaParams
): Promise<AdicionarMentoriaResult> {
  const { alunoId, data, slot, duracao = 20 } = params;

  try {
    // Normalizar a data para evitar problemas com fuso horário
    // Usar apenas ano, mês e dia para criar uma data UTC
    const dataNormalizada = new Date(Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate()
    ));

    // Verificar se o aluno existe
    const alunoExiste = await prisma.user.findUnique({
      where: { id: alunoId }
    });

    if (!alunoExiste) {
      return {
        success: false,
        error: 'Aluno não encontrado'
      };
    }

    // Buscar o horário existente ou criar um novo
    let horario = await prisma.horario.findFirst({
      where: {
        data: dataNormalizada,
        slot: slot
      },
      include: {
        mentorias: {
          where: {
            status: StatusMentoria.AGENDADA // Só contar mentorias ativas
          }
        }
      }
    });

    // Se o horário não existe, criar um novo
    if (!horario) {
      horario = await prisma.horario.create({
        data: {
          data: dataNormalizada,
          slot: slot,
          status: StatusHorario.LIVRE
        },
        include: {
          mentorias: {
            where: {
              status: StatusMentoria.AGENDADA
            }
          }
        }
      });
    }

    // Verificar se já existe mentoria para este aluno neste horário
    const mentoriaExistente = await prisma.mentoria.findUnique({
      where: {
        alunoId_horarioId: {
          alunoId: alunoId,
          horarioId: horario.id
        }
      }
    });

    if (mentoriaExistente) {
      return {
        success: false,
        error: 'Este aluno já possui uma mentoria agendada para este horário'
      };
    }

    // Verificar se ainda há vagas disponíveis (máximo 4 mentorias por horário)
    const mentoriasAtivas = horario.mentorias.length;
    if (mentoriasAtivas >= 4) {
      return {
        success: false,
        error: 'Este horário já possui o máximo de 4 mentorias agendadas'
      };
    }

    // Criar a nova mentoria
    const novaMentoria = await prisma.mentoria.create({
      data: {
        alunoId: alunoId,
        horarioId: horario.id,
        duracao: duracao,
        status: StatusMentoria.AGENDADA
      },
      include: {
        aluno: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        horario: {
          select: {
            id: true,
            data: true,
            slot: true,
            status: true
          }
        }
      }
    });

    // Se esta é a 4ª mentoria, marcar o horário como ocupado
    if (mentoriasAtivas + 1 >= 4) {
      await prisma.horario.update({
        where: { id: horario.id },
        data: { status: StatusHorario.OCUPADO }
      });
    }
    revalidatePath('/aluno/mentorias')
    revalidatePath('/professor/mentorias')

    return {
      success: true,
      mentoria: novaMentoria
    };

  } catch (error) {
    console.error('Erro ao adicionar mentoria:', error);

    // Tratamento de erros específicos do Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return {
          success: false,
          error: 'Já existe uma mentoria para este aluno neste horário'
        };
      }
    }

    return {
      success: false,
      error: 'Erro interno do servidor. Tente novamente.'
    };
  }
}

/**
 * Função auxiliar para verificar disponibilidade de um horário
 * @param data - Data da mentoria
 * @param slot - Slot de horário
 * @returns Número de vagas disponíveis (0-4)
 */
export async function verificarDisponibilidadeHorario(
  data: Date,
  slot: SlotHorario
): Promise<number> {
  try {
    // Normalizar a data para evitar problemas com fuso horário
    const dataNormalizada = new Date(Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate()
    ));

    const horario = await prisma.horario.findFirst({
      where: {
        data: dataNormalizada,
        slot: slot
      },
      include: {
        _count: {
          select: {
            mentorias: {
              where: {
                status: StatusMentoria.AGENDADA
              }
            }
          }
        }
      }
    });

    if (!horario) {
      return 4; // Se o horário não existe, há 4 vagas disponíveis
    }

    return Math.max(0, 4 - horario._count.mentorias);
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return 0;
  }
}


export async function listarMentoriasHorario(
  data?: Date,    // Tornando 'data' opcional
) {
  console.log('data recebida', data)
  try {
    // Inicializando os filtros
    const filtros: any = {};

    // Se a data for fornecida, normaliza e adiciona ao filtro
    if (data) {
      // Normalizar a data para evitar problemas com fuso horário
      const dataNormalizada = new Date(Date.UTC(
        data.getFullYear(),
        data.getMonth(),
        data.getDate()
      ));
      filtros.data = dataNormalizada;
    }

    // Realiza a consulta com os filtros condicionais
    const horarios = await prisma.horario.findMany({
      where: filtros,
      include: {
        mentorias: {
          include: {
            horario: true,
            aluno: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    // Retorna todas as mentorias encontradas
    return horarios.flatMap(horario => horario.mentorias) || [];
  } catch (error) {
    console.error('Erro ao listar mentorias:', error);
    return [];
  }
}


/**
 * Função para listar todas as mentorias de um aluno a partir do ID
 * @param alunoId - ID do aluno
 * @returns Lista de mentorias do aluno
 */
export async function listarMentoriasAluno(alunoId: string) {
  try {
    const mentorias = await prisma.mentoria.findMany({
      where: {
        alunoId: alunoId
      },
      include: {
        horario: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    return mentorias;
  } catch (error) {
    console.error('Erro ao listar mentorias do aluno:', error);
    return [];
  }
}

// Interface para editar mentoria
interface EditarMentoriaParams {
  mentoriaId: number;
  data: Date;
  slot: SlotHorario;
  duracao?: number;
}

// Tipo de retorno da função de edição
interface EditarMentoriaResult {
  success: boolean;
  mentoria?: Mentoria;
  error?: string;
}

/**
 * Edita uma mentoria existente
 * @param params - Parâmetros necessários para editar a mentoria
 * @returns Resultado da operação com a mentoria editada ou erro
 */
export async function editarMentoria(
  params: EditarMentoriaParams
): Promise<EditarMentoriaResult> {
  const { mentoriaId, data, slot, duracao = 20 } = params;

  try {
    // Normalizar a data para evitar problemas com fuso horário
    const dataNormalizada = new Date(Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate()
    ));

    // Buscar a mentoria existente
    const mentoriaExistente = await prisma.mentoria.findUnique({
      where: { id: mentoriaId },
      include: {
        aluno: true,
        horario: true
      }
    });

    if (!mentoriaExistente) {
      return {
        success: false,
        error: 'Mentoria não encontrada'
      };
    }

    // Verificar se o novo horário já existe
    let novoHorario = await prisma.horario.findFirst({
      where: {
        data: dataNormalizada,
        slot: slot
      },
      include: {
        mentorias: {
          where: {
            status: StatusMentoria.AGENDADA,
            id: { not: mentoriaId } // Excluir a mentoria atual da contagem
          }
        }
      }
    });

    // Se o horário não existe, criar um novo
    if (!novoHorario) {
      novoHorario = await prisma.horario.create({
        data: {
          data: dataNormalizada,
          slot: slot,
          status: StatusHorario.LIVRE
        },
        include: {
          mentorias: {
            where: {
              status: StatusMentoria.AGENDADA
            }
          }
        }
      });
    }

    // Verificar se ainda há vagas disponíveis no novo horário
    const mentoriasAtivas = novoHorario.mentorias.length;
    if (mentoriasAtivas >= 4) {
      return {
        success: false,
        error: 'Este horário já possui o máximo de 4 mentorias agendadas'
      };
    }

    // Atualizar a mentoria
    const mentoriaAtualizada = await prisma.mentoria.update({
      where: { id: mentoriaId },
      data: {
        horarioId: novoHorario.id,
        duracao: duracao
      },
      include: {
        aluno: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        horario: {
          select: {
            id: true,
            data: true,
            slot: true,
            status: true
          }
        }
      }
    });

    // Atualizar status do horário antigo se necessário
    const horarioAntigo = await prisma.horario.findUnique({
      where: { id: mentoriaExistente.horarioId },
      include: {
        _count: {
          select: {
            mentorias: {
              where: {
                status: StatusMentoria.AGENDADA
              }
            }
          }
        }
      }
    });

    if (horarioAntigo && horarioAntigo._count.mentorias === 0) {
      // Se não há mais mentorias no horário antigo, excluir o horário
      await prisma.horario.delete({
        where: { id: horarioAntigo.id }
      });
    } else if (horarioAntigo && horarioAntigo._count.mentorias < 4) {
      // Se há menos de 4 mentorias, marcar como livre
      await prisma.horario.update({
        where: { id: horarioAntigo.id },
        data: { status: StatusHorario.LIVRE }
      });
    }

    // Atualizar status do novo horário se necessário
    if (mentoriasAtivas + 1 >= 4) {
      await prisma.horario.update({
        where: { id: novoHorario.id },
        data: { status: StatusHorario.OCUPADO }
      });
    }

    revalidatePath('/aluno/mentorias')
    revalidatePath('/professor/mentorias')

    return {
      success: true,
      mentoria: mentoriaAtualizada
    };

  } catch (error) {
    console.error('Erro ao editar mentoria:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return {
          success: false,
          error: 'Já existe uma mentoria para este aluno neste horário'
        };
      }
    }

    return {
      success: false,
      error: 'Erro interno do servidor. Tente novamente.'
    };
  }
}

/**
 * Função para excluir uma mentoria e seu horário associado (efeito cascata)
 * @param mentoriaId - ID da mentoria a ser excluída
 * @returns true se excluído com sucesso, false caso contrário
 */
export async function excluirMentoriaECascata(mentoriaId: number) {
  try {
    // Busca a mentoria para obter o horarioId
    const mentoria = await prisma.mentoria.findUnique({
      where: { id: mentoriaId },
      select: { horarioId: true }
    });

    if (!mentoria) {
      console.error('Mentoria não encontrada para exclusão.');
      return false;
    }

    // Verifica quantas mentorias estão associadas a esse horarioId
    const countMentorias = await prisma.mentoria.count({
      where: { horarioId: mentoria.horarioId }
    });

    // Exclui a mentoria
    await prisma.mentoria.delete({
      where: { id: mentoriaId }
    });

    // Se era a única mentoria associada ao horário, exclui o horário também
    if (countMentorias === 1) {
      await prisma.horario.delete({
        where: { id: mentoria.horarioId }
      });
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir mentoria e horário em cascata:', error);
    return false;
  }
}

