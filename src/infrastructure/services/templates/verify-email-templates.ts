import { XPATMART_LOGO_BASE64 } from "@infrastructure/services/templates/assets/logo-base64";

export const generateVerificationEmailTemplate = (
  verificationCode: string,
  firstname: string
): string => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>XpatMart</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                     <img src="https://i.postimg.cc/mkvqgH0Q/logo.png" alt="XpatMart Logo" style="max-width: 150px; height: auto; margin-bottom: 20px;">
                    <h1 style="color: #333333; font-size: 24px; margin: 0;">XpatMart</h1>
                    <p style="color: #666666; margin-top: 5px;">Account Verification</p>
                </div>

                <div style="margin-bottom: 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.5;">Hello ${firstname},</p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.5;">Thank you for creating an account with XpatMart.<br>To complete your registration, please enter the verification code below:</p>
                </div>

                <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 30px;">
                    <p style="color: #666666; margin: 0 0 10px 0;">Enter this code in the app:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #333333; letter-spacing: 5px;">
                        ${verificationCode}
                    </div>
                </div>

                <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
                    <p style="color: #999999; font-size: 14px; line-height: 1.5;">
                        If you didn't create an account with XpatMart, you can safely ignore this email.
                        This verification code will expire in 24 hours.
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} XpatMart. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
};
