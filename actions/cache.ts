'use server'

import { updateTag } from "next/cache";

export async function atualizarCache(tag: string) {
    updateTag(tag);
}