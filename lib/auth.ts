
import {
    betterAuth
} from 'better-auth';
import { admin } from 'better-auth/plugins';
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from './prisma';


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                text: `Click the link to reset your password: ${url}`,
            });
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true
        // sendResetPassword: async ({user, url, token}, request) => {
        //     await sendEmail({
        //         to: user.email,
        //         subject: "Reset your password",
        //         text: `Click the link to reset your password: ${url}`,
        //     });
        // },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }
    },
    plugins: [
        admin()
    ]
}
);