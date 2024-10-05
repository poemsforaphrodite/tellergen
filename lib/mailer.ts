import { MailerSend, EmailParams } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY as string,
});

export const sendPasswordResetEmail = async (toEmail: string, resetToken: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;

  const emailParams = new EmailParams()
    .setFrom({
      email: process.env.MAILERSEND_FROM_EMAIL as string,
      name: 'TellerGen',
    })
    .setTo([
      {
        email: toEmail,
      },
    ])
    .setSubject('Password Reset Request')
    .setText(`You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`)
    .setHtml(`<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`);

  try {
    console.log('Attempting to send email with params:', emailParams);
    const result = await mailerSend.email.send(emailParams);
    console.log('Email sent successfully. Result:', result);
  } catch (error: any) {
    if (error instanceof Error) {
      console.error('Error sending password reset email:', {
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error('Unknown error sending password reset email:', error);
    }

    if (error.response) {
      console.error('API Response:', JSON.stringify(error.response, null, 2));
    }

    // Handle the error as needed
  }
};