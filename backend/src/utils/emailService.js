const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn(`⚠️  [EMAIL] Servicio no configurado. Omitiendo envío a ${to}. Define EMAIL_USER y EMAIL_PASS en .env`);
        return;
    }
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'AskingX Plataforma'}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        console.log(`✅ [EMAIL] Enviado a ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
        console.error(`❌ [ERROR EMAIL] No se pudo enviar a ${to}.`, error.message);
    }
};

module.exports = {
    sendEmail
};
