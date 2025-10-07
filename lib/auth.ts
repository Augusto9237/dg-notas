
import {
    betterAuth
} from 'better-auth';
import { admin } from 'better-auth/plugins';
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from './prisma';
import { Resend } from 'resend';
import ForgotPasswordEmail from '@/components/reset-password';

const resend = new Resend("re_5xEDKz2C_FEDq5RAcEUrnY6wEdw2sDoVH")


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({user, url}) => {
            resend.emails.send({
                from: 'onboarding@resend.dev',
                to: user.email,
                subject: "Redefinição de senha",
                react: ForgotPasswordEmail({userName: user.name, userEmail: user.email, resetUrl: url})
            });
        },
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