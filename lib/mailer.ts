import { MailerSend, EmailParams} from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY as string,
});

export const sendPasswordResetEmail = async (toEmail: string, resetToken: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;

  const emailParams = {
    from: {
      email: process.env.MAILERSEND_FROM_EMAIL as string,
      name: 'Your App Name',
    },
    to: [
      {
        email: toEmail,
      },
    ],
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
    html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
  } as EmailParams;

  try {
    await mailerSend.email.send(emailParams);
    console.log(`Password reset email sent to ${toEmail}`);
  } catch (error: any) {
    console.error('Error sending password reset email:', {
      message: error.message,
      stack: error.stack,
      response: error.response, // If available
    });
    throw new Error('Failed to send password reset email');
  }
};