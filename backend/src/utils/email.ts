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
