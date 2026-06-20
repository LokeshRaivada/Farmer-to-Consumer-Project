const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async ({ to, subject, text, html }) => {
    // Check if SMTP details are defined
    const hasSmtp = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (hasSmtp) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: `"FarmerDirect Support" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                html
            });
            console.log(`[SMTP] Email sent successfully to ${to}`);
            return;
        } catch (error) {
            console.error('[SMTP] Failed to send email via SMTP, falling back to local logs:', error.message);
        }
    }

    // Fallback: log to console and local file
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
