"use server";

import { Mentoria } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Tipos para os parâmetros da função
interface AdicionarMentoriaParams {
  alunoId: string;
  data: Date;
  slotId: number; // ID do SlotHorario
  diaSemanaId: number; // ID do DiaSemana
  duracao?: number; // Opcional, padrão 20 minutos
}

// Tipo de retorno da função
interface AdicionarMentoriaResult {
  success: boolean;
  mentoria?: Mentoria;
  error?: string;
}

// Enums importados do Prisma
import { StatusMentoria } from "@/app/generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function listarDiasSemana() {
  return await prisma.diaSemana.findMany({
    orderBy: {
      dia: 'asc'
    }
  })
}

export async function editarDiasSemana(id: number, status: boolean) {
  try {
    await prisma.diaSemana.update({
      where: {
        id: id
      },
      data: {
        status: status
      }
    })
    revalidatePath('/professor/mentorias')
  } catch (error) {
    console.log(error)
  }
}

export async function listarSlotsHorario() {
  return await prisma.slotHorario.findMany({})
}

export async function editarSlotsHorario(id: number, status: boolean) {
  try {
    await prisma.slotHorario.update({
      where: {
        id: id
      },
      data: {
        status: status
      }
    })

    revalidatePath('/professor/mentorias')
  } catch (error) {
    console.log(error)
  }
}

/**
 * Adiciona uma nova mentoria para um aluno em um horário específico
 * @param params - Parâmetros necessários para criar a mentoria
 * @returns Resultado da operação com a mentoria criada ou erro
 */
export async function adicionarMentoria(
  params: AdicionarMentoriaParams
): Promise<AdicionarMentoriaResult> {
  const { alunoId, data, slotId, diaSemanaId, duracao = 20 } = params;

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
        slotId: slotId
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
          slotId: slotId,
          diaSemanaId: diaSemanaId,
          status: true // Status como boolean (true = disponível)
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
        data: { status: false } // false = ocupado
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
 * @param slotId - ID do slot de horário
 * @returns Número de vagas disponíveis (0-4)
 */
export async function verificarDisponibilidadeHorario(
  data: Date,
  slotId: number,
  diaSemanaId: number,
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
        slotId: slotId,
        diaSemanaId: diaSemanaId
      },
      include: {
        _count: {
          select: {
            mentorias: true
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

/**
 * Verifica disponibilidade de múltiplos slots de uma vez (otimizado)
 * @param data - Data da mentoria
 * @param slotIds - Array de IDs dos slots de horário
 * @param diaSemanaId - ID do dia da semana
 * @returns Mapa com slotId como chave e número de vagas como valor
 */
export async function verificarDisponibilidadeMultiplosSlots(
  data: Date,
  slotIds: number[],
  diaSemanaId: number,
): Promise<Record<number, number>> {
  try {
    if (slotIds.length === 0) return {};

    // Normalizar a data para evitar problemas com fuso horário
    const dataNormalizada = new Date(Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate()
    ));

    // Buscar todos os horários de uma vez
    const horarios = await prisma.horario.findMany({
      where: {
        data: dataNormalizada,
        slotId: { in: slotIds },
        diaSemanaId: diaSemanaId
      },
      include: {
        _count: {
          select: {
            mentorias: true
          }
        }
      }
    });

    // Criar mapa de resultados (slotId -> vagas disponíveis)
    const resultado: Record<number, number> = {};

    // Inicializar todos os slots com 4 vagas (padrão quando não existe horário)
    slotIds.forEach(slotId => {
      resultado[slotId] = 4;
    });

    // Atualizar com os valores reais encontrados
    horarios.forEach(horario => {
      resultado[horario.slotId] = Math.max(0, 4 - horario._count.mentorias);
    });

    return resultado;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade múltipla:', error);
    // Retornar valores padrão em caso de erro
    const resultado: Record<number, number> = {};
    slotIds.forEach(slotId => {
      resultado[slotId] = 0;
    });
    return resultado;
  }
}


export async function listarMentoriasHorario(
  data?: Date
) {

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
            horario: {
              include: {
                slot: true
              }
            },
            aluno: true
          },
        }
      },
      orderBy: { data: 'asc' }
    });

    // Retorna todas as mentorias encontradas
    return horarios.flatMap(horario => horario.mentorias) || [];
  } catch (error) {
    console.error('Erro ao listar mentorias:', error);
    return [];
  }
}

export async function listarMentoriasMes(mes?: number, ano?: number) {
  const now = new Date();
  const targetMes = mes ?? (now.getMonth() + 1);
  const targetAno = ano ?? now.getFullYear();

  // Validações
  if (targetMes < 1 || targetMes > 12) {
    throw new Error('O mês deve estar entre 1 e 12');
  }

  // Criar intervalo de datas
  const startDate = new Date(Date.UTC(targetAno, targetMes - 1, 1));
  const endDate = new Date(Date.UTC(targetAno, targetMes, 1));

  try {
    const horarios = await prisma.horario.findMany({
      where: {
        data: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        mentorias: {
          include: {
            horario: {
              include: {
                slot: true
              }
            },
            aluno: true
          },
        }
      },
      orderBy: { data: 'asc' }
    });

    return horarios.flatMap(horario => horario.mentorias) || [];
  } catch (error) {
    console.error('Erro ao listar mentorias do mês:', error);
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
        horario: {
          include: {
            slot: true
          }
        }
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
  slotId: number; // ID do SlotHorario
  diaSemanaId: number; // ID do DiaSemana
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
  const { mentoriaId, data, slotId, diaSemanaId, duracao = 20 } = params;

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
        slotId: slotId
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
          slotId: slotId,
          diaSemanaId: diaSemanaId,
          status: true // Status como boolean (true = disponível)
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
        data: { status: true } // true = disponível
      });
    }

    // Atualizar status do novo horário se necessário
    if (mentoriasAtivas + 1 >= 4) {
      await prisma.horario.update({
        where: { id: novoHorario.id },
        data: { status: false } // false = ocupado
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

interface AtualizarStatusMentoriaResult {
  success: boolean;
  error?: string;
}

export async function atualizarStatusMentoria(
  mentoriaId: number,
  status: 'AGENDADA' | 'CONFIRMADA' | 'REALIZADA',
  feedback?: string
): Promise<AtualizarStatusMentoriaResult | Mentoria> {
  try {
    const mentoria = await prisma.mentoria.findUnique({
      where: { id: mentoriaId }
    });

    if (!mentoria) {
      return {
        success: false,
        error: 'Mentoria não encontrada'
      };
    }

    let dataToUpdate: {
      status: 'AGENDADA' | 'CONFIRMADA' | 'REALIZADA',
      feedback?: string
    } = { status };

    // Se for REALIZADA e houver feedback, incluir o feedback no update
    if (status === 'REALIZADA' && feedback) {
      dataToUpdate.feedback = feedback;
    }

    const mentoriaAtualizada = await prisma.mentoria.update({
      where: { id: mentoriaId },
      data: dataToUpdate,
      include: { aluno: true, horario: true }
    });

    revalidatePath('/aluno/mentorias');
    revalidatePath('/professor/mentorias');
    return mentoriaAtualizada;

  } catch (error) {
    console.error('Erro ao atualizar status da mentoria:', error);
    return {
      success: false,
      error: 'Erro ao atualizar status da mentoria'
    };
  }
}

/**
 * Função para excluir uma mentoria e seu horário associado (efeito cascata)
 * @param mentoriaId - ID da mentoria a ser excluída
 * @returns true se excluído com sucesso, false caso contrário
 */
export async function excluirMentoriaECascata(mentoriaId: number) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    throw new Error('Usuário não autorizado');
  }

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

    revalidatePath('/aluno/mentorias')
    revalidatePath('/professor/mentorias')

    return true;
  } catch (error) {
    console.error('Erro ao excluir mentoria e horário em cascata:', error);
    return false;
  }
}

export async function confirmarMentoria(mentoriaId: number) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session?.user) {
    throw new Error('Usuário não autorizado');
  }
  try {
    const mentoria = await prisma.mentoria.update({
      where: {
        id: mentoriaId
      },
      data: {
        status: 'CONFIRMADA'
      }
    })

    revalidatePath('/aluno/mentorias')
    revalidatePath('/professor/mentorias')
    return mentoria
  } catch (error) {
    console.log(error)
  }
}
