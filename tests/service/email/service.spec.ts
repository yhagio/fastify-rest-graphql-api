import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';

import EmailService from '../../../src/service/email/service';

chai.use(sinonChai);
const expect = chai.expect;

describe('Service', () => {
  const sandbox = sinon.createSandbox();

  const config: any = {
    get: sandbox.stub()
  };
  const send = sandbox.stub();
  const client: any = {
    messages: () => ({
      send
    })
  };

  let emailService: EmailService;

  const url = 'test_url';
  const email = 'test@cc.cc';
  const name = 'alice';
  const token = 'abc-123-token';

  beforeEach(() => {
    config.get.withArgs('client_base_url').returns(url);
    send.resolves();
    emailService = new EmailService(client, config);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('EmailService', () => {
    describe('sendWelcome', () => {
      it('send user welcome email', async () => {
        await emailService.sendWelcome(email, name);

        expect(send).to.have.been.calledOnce;
        const sendArg = send.getCall(0).args[0];
        expect(sendArg).to.have.property('from', 'MyApp Admin <support@myapp.com>');
        expect(sendArg).to.have.property('to', email);
        expect(sendArg).to.have.property('subject', 'Welcome to MyApp');
        expect(sendArg.text).to.contain(name);
        expect(sendArg.html).to.contain(name);
      });
    });

    describe('sendResetPassword', () => {
      it('send user resetting password instruction email', async () => {
        const resetUrl = `${url}/reset_password?token=${token}`;
        await emailService.sendResetPassword(email, token);

        expect(send).to.have.been.calledOnce;
        const sendArg = send.getCall(0).args[0];
        expect(sendArg).to.have.property('from', 'MyApp Admin <support@myapp.com>');
        expect(sendArg).to.have.property('to', email);
        expect(sendArg).to.have.property('subject', 'MyApp: Reset password instruction');
        expect(sendArg.text).to.contain(token);
        expect(sendArg.text).to.contain(resetUrl);
        expect(sendArg.html).to.contain(token);
        expect(sendArg.html).to.contain(resetUrl);
      });
    });
  });
});
