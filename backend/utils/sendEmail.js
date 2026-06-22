const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const net = require('net');

const sendEmail = async ({ to, subject, text, html }) => {
    const emailEnabled = process.env.EMAIL_ENABLED !== 'false';
    const isRequired = process.env.EMAIL_VERIFICATION_REQUIRED !== 'false';
    const isDev = process.env.NODE_ENV === 'development';

    if (!emailEnabled) {
        console.log(`ℹ️ [EMAIL] Email features are disabled globally (EMAIL_ENABLED=false). Logging email to ${to} to sandbox.`);
        logToSandbox({ to, subject, text, html });
        return;
    }

    const hasSmtp = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
    if (!hasSmtp) {
        console.warn('⚠️ [SMTP] Nodemailer environment variables are missing.');
        if (!isRequired || isDev) {
            console.log('ℹ️ [SMTP] Falling back to local logging in development mode.');
            logToSandbox({ to, subject, text, html });
            return;
        }
        throw new Error('SMTP configuration missing, but email verification is required.');
    }

    try {
        const smtpPort = parseInt(process.env.EMAIL_PORT) || 587;
        const smtpSecure = process.env.EMAIL_SECURE !== undefined
            ? process.env.EMAIL_SECURE === 'true'
            : (smtpPort === 465);

        let host = process.env.EMAIL_HOST;
        let servername = undefined;

        if (host && !net.isIP(host)) {
            try {
                const lookup = await dns.lookup(host, { family: 4 });
                servername = host;
                host = lookup.address;
                console.log(`ℹ️ [SMTP] Resolved ${process.env.EMAIL_HOST} to IPv4 ${host}`);
            } catch (dnsErr) {
                console.warn(`⚠️ [SMTP] DNS lookup failed for ${host}:`, dnsErr.message);
            }
        }

        const transporter = nodemailer.createTransport({
            host: host,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: servername ? { servername } : undefined,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000
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
        if (!isRequired || isDev) {
            console.log('ℹ️ [SMTP] Falling back to local logging in development mode.');
            logToSandbox({ to, subject, text, html });
        } else {
            throw error;
        }
    }
};

const logToSandbox = ({ to, subject, text, html }) => {
    // Attempt to write to the agent's scratch directory for local debugging
    const agentLogDir = 'C:\\Users\\jubbu\\.gemini\\antigravity\\brain\\f0e52cbe-f91e-43d3-902a-5b139c4cd643\\scratch';
    // Fallback to local project scratch directory
    const projectLogDir = path.join(__dirname, '..', 'scratch');
    
    let logDir = agentLogDir;
    
    // If not on Windows or the agent directory is missing and cannot be created, use projectLogDir
    if (process.platform !== 'win32') {
        logDir = projectLogDir;
    }

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
        console.log(`\n📧 [EMAIL SANDBOX] Email to <${to}> logged to ${path.relative(process.cwd(), logPath)}\nSubject: ${subject}\nText: ${text}\n`);
    } catch (err) {
        // If agent log directory failed, try the project log directory as a secondary fallback
        if (logDir !== projectLogDir) {
            try {
                if (!fs.existsSync(projectLogDir)) {
                    fs.mkdirSync(projectLogDir, { recursive: true });
                }
                const projectLogPath = path.join(projectLogDir, 'email_log.txt');
                fs.appendFileSync(projectLogPath, logContent, 'utf8');
                console.log(`\n📧 [EMAIL SANDBOX] Email to <${to}> logged to ${path.relative(process.cwd(), projectLogPath)}\nSubject: ${subject}\nText: ${text}\n`);
                return;
            } catch (fallbackErr) {
                console.error('Failed to write email to secondary sandbox log file:', fallbackErr.message);
            }
        }
        console.error('Failed to write email to sandbox log file:', err.message);
        console.log(`\n📧 [EMAIL SANDBOX CONSOLE ONLY] Email to <${to}>\nSubject: ${subject}\nText: ${text}\n`);
    }
};

module.exports = sendEmail;
