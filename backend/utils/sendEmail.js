const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async ({ to, subject, text, html }) => {
    const emailEnabled = process.env.EMAIL_ENABLED !== 'false';
    const isRequired = process.env.EMAIL_VERIFICATION_REQUIRED !== 'false';

    if (!emailEnabled) {
        console.log(`ℹ️ [EMAIL] Email features are disabled globally (EMAIL_ENABLED=false). Logging email to ${to} to sandbox.`);
        logToSandbox({ to, subject, text, html });
        return;
    }

    const hasSmtp = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
    if (!hasSmtp) {
        console.warn('⚠️ [SMTP] Nodemailer environment variables are missing.');
        if (!isRequired) {
            logToSandbox({ to, subject, text, html });
            return;
        }
        throw new Error('SMTP configuration missing, but email verification is required.');
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.verify();

        const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        await transporter.sendMail({
            from: fromAddress,
            to,
            subject,
            text,
            html
        });
        console.log(`📧 [SMTP] Email sent successfully to ${to}`);
    } catch (error) {
        console.error('❌ [SMTP] Failed to send email via SMTP:', error.message);
        if (!isRequired) {
            console.log('ℹ️ [SMTP] Falling back to local logging in development mode.');
            logToSandbox({ to, subject, text, html });
        } else {
            throw error;
        }
    }
};

const logToSandbox = ({ to, subject, text, html }) => {
    const logDir = 'C:\\Users\\jubbu\\.gemini\\antigravity\\brain\\f0e52cbe-f91e-43d3-902a-5b139c4cd643\\scratch';
    const logPath = path.join(logDir, 'email_log.txt');
    const separator = '\n' + '='.repeat(60) + '\n';
    const logContent = `
Timestamp: ${new Date().toISOString()}
To: ${to}
Subject: ${subject}
Text: ${text}
${html ? `HTML Content:\n${html}` : ''}
${separator}`;

    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(logPath, logContent, 'utf8');
        console.log(`\n📧 [EMAIL SANDBOX] Email to <${to}> logged to scratch/email_log.txt\nSubject: ${subject}\nText: ${text}\n`);
    } catch (err) {
        console.error('Failed to write email to sandbox log file:', err.message);
        console.log(`\n📧 [EMAIL SANDBOX CONSOLE ONLY] Email to <${to}>\nSubject: ${subject}\nText: ${text}\n`);
    }
};

module.exports = sendEmail;
