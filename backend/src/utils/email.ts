import nodemailer from 'nodemailer';
import logger from './logger';

// Email configuration from environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Swift Transfer" <${emailConfig.auth.user}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  static async sendOTP(email: string, otp: string): Promise<boolean> {
    const subject = 'Your OTP for Swift Transfer';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Swift Transfer - OTP Verification</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 16px; margin: 0 0 10px 0;">Your OTP code is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #007bff; text-align: center; padding: 15px; background-color: white; border-radius: 4px; border: 1px solid #dee2e6;">
            ${otp}
          </div>
        </div>
        <p style="color: #666; font-size: 14px;">
          This OTP will expire in 5 minutes. Please do not share this code with anyone.
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          If you didn't request this OTP, please ignore this email.
        </p>
      </div>
    `;

    const text = `Your OTP for Swift Transfer is: ${otp}. This code will expire in 5 minutes.`;

    return await this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  static async sendUserCredentialsEmail(email: string, fullName: string, password: string): Promise<boolean> {
    const subject = 'Welcome to Swift Transfer - Your Account Credentials';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Welcome to Swift Transfer!</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 16px; margin: 0 0 15px 0;">Hello ${fullName},</p>
          <p style="margin: 0 0 15px 0;">Your Swift Transfer account has been created successfully. Here are your login credentials:</p>

          <div style="background-color: white; padding: 15px; border-radius: 4px; border: 1px solid #dee2e6; margin: 15px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 8px 0;"><strong>Password:</strong> ${password}</p>
          </div>

          <p style="color: #d73e3e; font-weight: bold; margin: 15px 0;">
            ⚠️ Please change your password after first login for security.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/login"
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Login to Your Account
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      Welcome to Swift Transfer!

      Hello ${fullName},

      Your Swift Transfer account has been created successfully.

      Email: ${email}
      Password: ${password}

      ⚠️ Please change your password after first login for security.

      Login at: ${process.env.FRONTEND_URL || 'http://localhost:8080'}/login
    `;

    return await this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  static async testConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;

// Export the function directly for convenience
export const sendUserCredentialsEmail = EmailService.sendUserCredentialsEmail;
