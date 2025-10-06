
import { Session } from '@/lib/auth-client'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(url: string, user: Session) {
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'augusto.souza8330@gmail.com',
        subject: 'Verifique seu e-mail',
        react: 
    })

}

// resend.emails.send({
//   from: 'onboarding@resend.dev',
//   to: 'augusto.souza8330@gmail.com',
//   subject: 'Hello World',
//   html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
// });