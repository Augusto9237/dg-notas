export function resolverIntervaloMes(mes?: number, ano?: number) {
    const agora = new Date();
    const targetMes = mes ?? agora.getMonth() + 1;
    const targetAno = ano ?? agora.getFullYear();
  
    if (targetMes < 1 || targetMes > 12) {
      throw new Error('O mês deve estar entre 1 e 12');
    }
  
    if (targetAno < 1900 || targetAno > 2100) {
      throw new Error('Ano inválido');
    }
  
    const startDate = new Date(Date.UTC(targetAno, targetMes - 1, 1));
    const endDate = new Date(Date.UTC(targetAno, targetMes, 1));
  
    // Guarda contra NaN que passa direto pelas comparações acima
    // (mesma pegadinha do Number(null) que vimos no TabelaTopAlunos)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Erro ao criar datas de filtro');
    }
  
    return { startDate, endDate };
  }
