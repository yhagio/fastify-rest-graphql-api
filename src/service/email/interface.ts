export interface IEmailService {
  sendWelcome(recipientEmail: string, recipientName: string): Promise<void>;
  sendResetPassword(recipientEmail: string, token: string): Promise<void>;
}
