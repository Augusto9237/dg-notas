// lib/session.ts
import { cache } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getSessionCached = cache(async () => {
    return auth.api.getSession({ headers: await headers() });
});