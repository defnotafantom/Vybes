import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, verificationUrl: string) {
  // Check if email is configured
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER) {
    console.warn('⚠️ Email not configured - skipping email send')
    console.log('📧 Would send verification email to:', email)
    console.log('🔗 Verification URL:', verificationUrl)
    // In development, we can skip email and auto-verify
    return Promise.resolve()
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
    to: email,
    subject: 'Verifica il tuo account - Vybes',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #9333ea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Benvenuto su Vybes!</h1>
            <p>Grazie per esserti registrato. Per completare la registrazione, clicca sul pulsante sottostante per verificare il tuo indirizzo email:</p>
            <a href="${verificationUrl}" class="button">Verifica Email</a>
            <p>Oppure copia e incolla questo link nel tuo browser:</p>
            <p>${verificationUrl}</p>
            <p>Questo link scadrà tra 24 ore.</p>
            <p>Se non hai richiesto questa registrazione, ignora questa email.</p>
          </div>
        </body>
      </html>
    `,
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', result.messageId)
    return result
  } catch (error) {
    console.error('❌ Email send error:', error)
    throw error
  }
}

