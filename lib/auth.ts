import { PrismaClient } from '@/app/generated/prisma';
import {
    betterAuth
} from 'better-auth';
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from './prisma';


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        async sendResetPassword(data, request) {
            // Send an email to the user with a link to reset their password
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }
    },

    /** if no database is provided, the user data will be stored in memory.
     * Make sure to provide a database to persist user data **/
});