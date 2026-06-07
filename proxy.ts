import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Mapeamento de role → rota principal do usuário
const roleHomeMap: Record<string, string> = {
    user: '/aluno',
    professor: '/professor',
    assistente: '/assistente',
    admin: '/admin',
};

// Mapeamento de prefixo de rota → role necessária
const routeRoleMap: Record<string, string> = {
    '/aluno': 'user',
    '/professor': 'professor',
    '/assistente': 'assistente',
    '/admin': 'admin',
};

export async function proxy(request: NextRequest) {
    // 1. Obtemos a sessão usando os headers do próprio request (padrão de segurança em proxies/redes)
    const session = await auth.api.getSession({
        headers: request.headers
    });

    const pathname = request.nextUrl.pathname;

    // 2. Se não houver sessão ativa, redireciona para a Home (Página de login)
    if (!session?.user) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const userRole = session.user.role as string;
    const userHome = roleHomeMap[userRole];

    // 3. Se a role não for reconhecida, faz signOut e redireciona para login
    if (!userHome) {
        await auth.api.signOut({ headers: request.headers });
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("better-auth.session-token");
        return response;
    }

    // 4. Verifica se a rota acessada pertence a outra área
    // Usa comparação por segmento (prefix + '/') para evitar falsos positivos
    // e.g. '/aluno-admin' não deve disparar a regra de '/aluno'
    const matchedPrefix = Object.keys(routeRoleMap).find(
        prefix => pathname === prefix || pathname.startsWith(prefix + '/')
    );

    if (matchedPrefix) {
        const requiredRole = routeRoleMap[matchedPrefix];
        if (userRole !== requiredRole) {
            // Redireciona para a área correta do usuário (sem deslogar)
            return NextResponse.redirect(new URL(userHome, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/aluno/:path*',
        '/professor/:path*',
        '/assistente/:path*',
        '/admin/:path*'
    ]
}
