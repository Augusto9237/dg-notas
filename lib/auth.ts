
import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from './prisma';
import { Resend } from 'resend';
import ForgotPasswordEmail from '@/components/reset-password';

const resend = new Resend(process.env.RESEND_API_KEY as string)

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            especialidade: {
                type: "string",
                required: false,
            },
            telefone: {
                type: "string",
                required: false,
            },
            bio: {
                type: "string",
                required: false,
            },
            matriculado: {
                type: "boolean",
                required: false
            }
        },
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: user.email,
                subject: "Redefinição de senha",
                react: ForgotPasswordEmail({ userName: user.name, userEmail: user.email, resetUrl: url })
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
        admin({
            adminRoles: ["admin", "professor"]
        })
    ]
});