import MailgunClient from 'mailgun-js';

import IConfig from '../../common/config';

export default class Mailgun {
  private connection: MailgunClient.Mailgun;

  constructor(private config: IConfig) {
    this.connection = MailgunClient(this.config.get('infra.mailgun'));
  }

  getConnection(): MailgunClient.Mailgun {
    return this.connection;
  }
}
