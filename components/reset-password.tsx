import * as React from 'react';
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
    Img,
} from '@react-email/components';

interface ForgotPasswordEmailProps {
    userName: string;
    userEmail: string;
    resetUrl: string;
}

const ForgotPasswordEmail = ({ userName, resetUrl, userEmail }: ForgotPasswordEmailProps) => {


    return (
        <Html lang="en" dir="ltr">
            <Tailwind>
                <Head />
                <Preview>Redefinir sua senha - Ação necessária</Preview>
                <Body className="bg-zinc-100 font-sans py-[40px]">
                    <Container className="bg-white rounded-[8px] px-[32px] py-[40px] mx-auto max-w-md">
                        {/* Header */}
                        <Section className="text-center mb-[32px]">
                            <Heading className="text-[24px] font-bold text-gray-900 mb-[16px] mt-0">
                                Redefinir sua Senha
                            </Heading>
                            <Text className="text-[16px] text-gray-600 mt-0 mb-0">
                                Recebemos uma solicitação para redefinir a senha da sua conta
                            </Text>
                        </Section>

                        {/* Main Content */}
                        <Section className="mb-[32px]">
                            <Text className="text-[16px] text-gray-700 mb-[16px] mt-0">
                                Olá! {userName}
                            </Text>
                            <Text className="text-[16px] text-gray-700 mb-[16px] mt-0">
                                Alguém solicitou uma redefinição de senha para sua conta associada ao <strong>e-mail: {userEmail}</strong>.
                                Se foi você, clique no botão abaixo para redefinir sua senha
                            </Text>
                            <Text className="text-[16px] text-gray-700 mb-[24px] mt-0">
                                Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança.
                                Sua senha permanecerá inalterada.
                            </Text>

                            {/* Reset Button */}
                            <Section className="text-center mb-[32px]">
                                <Button
                                    href={resetUrl}
                                    className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
                                >
                                    Redefinir senha
                                </Button>
                            </Section>

                            <Text className="text-[14px] text-gray-600 mb-[16px] mt-0">
                                Este link irá expirar em 24 horas por motivos de segurança.
                            </Text>

                            <Text className="text-[14px] text-gray-600 mb-[16px] mt-0">
                                Se o botão não funcionar, você pode copiar e colar este link no seu navegador:
                            </Text>
                            <Text className="text-[14px] text-blue-600 mb-[24px] mt-0 break-all">
                                <Link href={resetUrl} className="text-blue-600 underline">
                                    {resetUrl}
                                </Link>
                            </Text>
                        </Section>

                        {/* Footer */}
                        <Section className="border-t border-gray-200 pt-[24px]">
                            <Text className="text-[12px] text-gray-500 text-center mb-[8px] mt-0">
                                Este e-mail foi enviado para{userEmail}
                            </Text>
                            <Text className="text-[12px] text-gray-500 text-center mb-[8px] mt-0 m-0">
                                © 2025 DG - Redação. Todos os direitos reservados.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ForgotPasswordEmail;