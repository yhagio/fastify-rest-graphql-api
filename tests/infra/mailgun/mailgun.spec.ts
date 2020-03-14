import sinon from 'sinon';
import { expect } from 'chai';

import Mailgun from '../../../src/infra/mailgun/mailgun';

describe('Mailgun', () => {
  const sandbox = sinon.createSandbox();

  const config: any = {
    get: sandbox.stub()
  };
  const mailgunClient = sandbox.stub();
  const connection: any = {};
  let mailgun: Mailgun;

  beforeEach(() => {
    config.get.withArgs('infra.mailgun').returns('config');
    mailgunClient.withArgs('config').returns(connection);
    mailgun = new Mailgun(mailgunClient, config);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('getConnection', () => {
    it('get mailgun connection', () => {
      expect(mailgun.getConnection()).to.be.eql(connection);
    });
  });
});
