import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

    // 3. Mapeamento de rotas e suas respectivas roles necessárias
    const roleMapping = {
        '/aluno': 'user',
        '/professor': 'professor',
        '/assistente': 'assistente',
        '/admin': 'admin'
    } as const;

    // 4. Verificação de permissão por rota
    for (const [pathPrefix, requiredRole] of Object.entries(roleMapping)) {
        if (pathname.startsWith(pathPrefix)) {
            if (session.user.role !== requiredRole) {
                await auth.api.signOut({
                    headers: request.headers
                });

                const response = NextResponse.redirect(new URL("/", request.url));
                
                // Limpa o cookie de sessão do navegador para garantir a desconexão completa
                response.cookies.delete("better-auth.session-token");
                return response;
            }
            break;
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
