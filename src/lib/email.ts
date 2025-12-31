import { Resend } from "resend";

interface SendEmailParams {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export async function sendEmail({to, subject, text, html}: SendEmailParams) {

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const response = await resend.emails.send({
            from: "Teacher's Aid <email-verification@teachersaid.tech>",
            to: to, 
            subject: subject,
            text: text || "",
            html: html || text || "",
        });

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Professional email verification template
export function getEmailVerificationTemplate(userName: string, verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                Teacher's Aid
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                                Verify Your Email Address
                            </h2>
                            
                            <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                                Hello${userName ? ` ${userName}` : ''},
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                                Thank you for signing up for Teacher's Aid! To complete your registration and start managing your students, please verify your email address by clicking the button below.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0 0 10px; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 30px; color: #667eea; font-size: 14px; line-height: 1.6; word-break: break-all;">
                                <a href="${verificationUrl}" style="color: #667eea; text-decoration: none;">${verificationUrl}</a>
                            </p>
                            
                            <!-- Security Notice -->
                            <div style="padding: 20px; background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px; margin: 30px 0;">
                                <p style="margin: 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                                    <strong style="color: #1a1a1a;">Security Notice:</strong> This verification link will expire in 24 hours. If you didn't create an account with Teacher's Aid, please ignore this email.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px; color: #6b6b6b; font-size: 14px; line-height: 1.6; text-align: center;">
                                Need help? Contact us at <a href="mailto:support@teachersaid.tech" style="color: #667eea; text-decoration: none;">support@teachersaid.tech</a>
                            </p>
                            <p style="margin: 0; color: #9b9b9b; font-size: 12px; line-height: 1.6; text-align: center;">
                                © ${new Date().getFullYear()} Teacher's Aid. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}