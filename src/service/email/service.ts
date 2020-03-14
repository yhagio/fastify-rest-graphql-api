import { Mailgun, messages } from 'mailgun-js';
import { IEmailService } from './interface';
import IConfig from '../../common/config';

export default class EmailService implements IEmailService {
  constructor(private readonly emailClient: Mailgun, private readonly config: IConfig) {}

  async sendWelcome(recipientEmail: string, recipientName: string): Promise<void> {
    const data: messages.SendData = {
      from: 'MyApp Admin <support@myapp.com>',
      to: recipientEmail,
      subject: 'Welcome to MyApp',
      text: `
        Hi ${recipientName},
        Big welcome from MyApp Team!

        We really hope you enjoy using MyApp!

        Best,
        MyApp Team
      `,
      html: `
        Hi ${recipientName}<br/>
        <br/>
        Welcome to <a href="${this.getClientURL()}">MyApp</a>! We really hope you enjoy using MyApp!<br/>
        <br/>
        Best,<br/>
        MyApp Team
      `
    };
    await this.emailClient.messages().send(data);
  }

  async sendResetPassword(recipientEmail: string, token: string): Promise<void> {
    const resetPassworlURL = `${this.getClientURL()}/reset_password?token=${token}`;

    const data: messages.SendData = {
      from: 'MyApp Admin <support@myapp.com>',
      to: recipientEmail,
      subject: 'MyApp: Reset password instruction',
      text: `
        Hi there from MyApp Team,

        It appears that you have requested a password reset. If this was you, please follow the link below to update your password:

        ${resetPassworlURL}

        If you are asked for a token, please use the following value:

        ${token}

        If you didn't request a password reset you can safely ignore this email and your account will not be changed.

        Best,
        MyApp Team
      `,
      html: `
        Hi there from MyApp Team<br/>
        <br/>
        It appears that you have requested a password reset. If this was you, please follow the link below to update your password:<br/>
        <br/>
        <a href="${resetPassworlURL}">${resetPassworlURL}</a><br/>
        <br/>
        If you are asked for a token, please use the following value:<br/>
        <br/>
        ${token}<br/>
        <br/>
        If you didn't request a password reset you can safely ignore this email and your account will not be changed.<br/>
        <br/>
        Best,<br/>
        MyApp Team<br/>
      `
    };
    await this.emailClient.messages().send(data);
  }

  private getClientURL(): string {
    return this.config.get('client_base_url');
  }
}
