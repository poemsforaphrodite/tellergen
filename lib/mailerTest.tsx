'use client';

import { useEffect } from 'react';
import { sendPasswordResetEmail } from './mailer';

export default function MailerTest() {
  useEffect(() => {
    const testEmail = async () => {
      try {
        await sendPasswordResetEmail('your-email@example.com', 'testtoken123');
        console.log('Test email sent successfully.');
      } catch (error) {
        console.error('Test email failed:', error);
      }
    };

    testEmail();
  }, []);

  return <div>Sending Test Email...</div>;
}