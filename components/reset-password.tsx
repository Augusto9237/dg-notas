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
} from '@react-email/components';

interface ForgotPasswordEmailProps {
    userName: string;
    userEmail: string;
    resetUrl: string;
}

const ForgotPasswordEmail = ({userName, resetUrl, userEmail}: ForgotPasswordEmailProps) => {
   

    return (
        <Html lang="en" dir="ltr">
            <Tailwind>
                <Head />
                <Preview>Reset your password - Action required</Preview>
                <Body className="bg-gray-100 font-sans py-[40px]">
                    <Container className="bg-white rounded-[8px] px-[32px] py-[40px] mx-auto max-w-[600px]">
                        {/* Header */}
                        <Section className="text-center mb-[32px]">
                            <Heading className="text-[24px] font-bold text-gray-900 mb-[16px] mt-0">
                                Reset Your Password
                            </Heading>
                            <Text className="text-[16px] text-gray-600 mt-0 mb-0">
                                We received a request to reset your password for your account
                            </Text>
                        </Section>

                        {/* Main Content */}
                        <Section className="mb-[32px]">
                            <Text className="text-[16px] text-gray-700 mb-[16px] mt-0">
                                Hello,{userName}!
                            </Text>
                            <Text className="text-[16px] text-gray-700 mb-[16px] mt-0">
                                Someone requested a password reset for your account associated with <strong>{userEmail}</strong>.
                                If this was you, click the button below to reset your password.
                            </Text>
                            <Text className="text-[16px] text-gray-700 mb-[24px] mt-0">
                                If you didn't request this password reset, you can safely ignore this email.
                                Your password will remain unchanged.
                            </Text>

                            {/* Reset Button */}
                            <Section className="text-center mb-[32px]">
                                <Button
                                    href={resetUrl}
                                    className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
                                >
                                    Reset Password
                                </Button>
                            </Section>

                            <Text className="text-[14px] text-gray-600 mb-[16px] mt-0">
                                This link will expire in 24 hours for security reasons.
                            </Text>

                            <Text className="text-[14px] text-gray-600 mb-[16px] mt-0">
                                If the button doesn't work, you can copy and paste this link into your browser:
                            </Text>
                            <Text className="text-[14px] text-blue-600 mb-[24px] mt-0 break-all">
                                <Link href={resetUrl} className="text-blue-600 underline">
                                    {resetUrl}
                                </Link>
                            </Text>
                        </Section>

                        {/* Security Notice */}
                        <Section className="border-t border-gray-200 pt-[24px] mb-[32px]">
                            <Heading className="text-[18px] font-semibold text-gray-900 mb-[12px] mt-0">
                                Security Tips
                            </Heading>
                            <Text className="text-[14px] text-gray-600 mb-[8px] mt-0">
                                • Never share your password with anyone
                            </Text>
                            <Text className="text-[14px] text-gray-600 mb-[8px] mt-0">
                                • Use a strong, unique password for your account
                            </Text>
                            <Text className="text-[14px] text-gray-600 mb-[8px] mt-0">
                                • Enable two-factor authentication when available
                            </Text>
                        </Section>

                        {/* Footer */}
                        <Section className="border-t border-gray-200 pt-[24px]">
                            <Text className="text-[12px] text-gray-500 text-center mb-[8px] mt-0">
                                This email was sent to {userEmail}
                            </Text>
                            <Text className="text-[12px] text-gray-500 text-center mb-[8px] mt-0 m-0">
                                © 2025 Your Company Name. All rights reserved.
                            </Text>
                            <Text className="text-[12px] text-gray-500 text-center mb-[8px] mt-0 m-0">
                                123 Business Street, Suite 100, City, State 12345
                            </Text>
                            <Text className="text-[12px] text-gray-500 text-center mt-0 mb-0">
                                <Link href="#" className="text-gray-500 underline">
                                    Unsubscribe
                                </Link>
                                {' | '}
                                <Link href="#" className="text-gray-500 underline">
                                    Privacy Policy
                                </Link>
                                {' | '}
                                <Link href="#" className="text-gray-500 underline">
                                    Contact Support
                                </Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

ForgotPasswordEmail.PreviewProps = {
    userEmail: 'augusto.souza8330@gmail.com',
    resetUrl: 'https://yourapp.com/reset-password?token=abc123xyz789',
};

export default ForgotPasswordEmail;