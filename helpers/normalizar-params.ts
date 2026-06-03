export function normalizarParams(mes?: string, ano?: string) {
    const hoje = new Date();
    const mesPadrao = (hoje.getMonth() + 1).toString();
    const anoPadrao = hoje.getFullYear().toString();

    return {
        mes: mes ?? mesPadrao,
        ano: ano ?? anoPadrao,
    };
}