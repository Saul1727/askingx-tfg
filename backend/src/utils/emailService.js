const nodemailer = require('nodemailer');

// Configuración del transporter (servidor de correo)
// PARA EL TFG: Puedes usar una cuenta de Gmail real activando "Contraseñas de aplicación"
// o usar un servicio de pruebas como Ethereal (https://ethereal.email/)
const transporter = nodemailer.createTransport({
    service: 'gmail', // O el proveedor que uses (Outlook, Yahoo...)
    auth: {
        user: process.env.EMAIL_USER || 'tu_correo@gmail.com', // Pon tu correo
        pass: process.env.EMAIL_PASS || 'tu_contraseña_de_aplicacion' // Pon la contraseña de aplicación
    }
});

/**
 * Envía un correo electrónico al realizar un match.
 * @param {string} to - Email del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} text - Contenido del correo en texto plano
 */
const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: `"AskingX Plataforma" <${process.env.EMAIL_USER || 'tu_correo@gmail.com'}>`,
            to,
            subject,
            text,
        });
        console.log(`✅ [EMAIL REAL SIMULADO] Correo enviado a ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
        console.error(`❌ [ERROR EMAIL] No se pudo enviar a ${to}. Revisa las credenciales en emailService.js.`, error.message);
    }
};

module.exports = {
    sendEmail
};
