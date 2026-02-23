'use server'

import { auth } from "@/lib/auth";
import { updateTag } from "next/cache";
import { headers } from "next/headers";

async function revalidarCache(tag: string) {
    updateTag(tag);
}

export async function atualizarCache(tag: string) {
     const session = await auth.api.getSession({
            headers: await headers()
        })
    
        if (!session?.user) {
            throw new Error('Usuário não autorizado');
        }
      revalidarCache(tag);
}