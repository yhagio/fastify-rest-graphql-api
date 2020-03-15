import sinon from 'sinon';
import { expect } from 'chai';

import AuthHandler from '../../src/handler/auth';
import { InvalidError } from '../../src/common/error/invalid';
import { NotFoundError } from '../../src/common/error/notFound';
import { UnauthorizedError } from '../../src/common/error/unauthorized';

describe('AuthHandler', () => {
  const sandbox = sinon.createSandbox();

  const authService: any = {
    issueToken: sandbox.stub(),
    checkPassword: sandbox.stub()
  };
  const userService: any = {
    create: sandbox.stub(),
    getByEmailWithPassword: sandbox.stub(),
    getOneById: sandbox.stub()
  };
  const emailService: any = {
    sendWelcome: sandbox.stub(),
    sendResetPassword: sandbox.stub()
  };
  const resetPassService: any = {
    create: sandbox.stub(),
    completeResetPassword: sandbox.stub()
  };
  let req: any = {
    body: {}
  };

  const send: any = sandbox.stub();
  const res: any = {
    code: sandbox.stub()
  };
  const next: any = sandbox.stub();

  let handler: AuthHandler;

  const user: any = {
    first_name: 'alice',
    email: 'alice@cc.cc'
  };
  const token = 'token';

  beforeEach(() => {
    res.code.withArgs(200).returns({ send });
    next.returns();
    handler = new AuthHandler(authService, userService, emailService, resetPassService);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('signUp', () => {
    it('successfully went through', async () => {
      userService.create.withArgs(req.body).resolves(user);
      authService.issueToken.withArgs(user).resolves(token);
      emailService.sendWelcome.withArgs(user.email, user.first_name).resolves();

      await handler.signUp(req, res);
      expect(send).to.have.been.calledWith({
        data: {
          user,
          token
        }
      });
      expect(emailService.sendWelcome).to.have.callCount(1);
    });
  });

  describe('login', () => {
    it('successfully went through', async () => {
      req.body.email = 'email';
      req.body.password = 'pass1234';
      userService.getByEmailWithPassword.withArgs(req.body.email).resolves(user);
      authService.checkPassword.withArgs(req.body.password, user.password).resolves(true);
      authService.issueToken.withArgs(user).resolves(token);

      await handler.login(req, res);
      const { password: _, ...rest } = user;
      expect(send).to.have.been.calledWith({
        data: {
          user: { ...rest },
          token
        }
      });
    });

    it('no user found with email', () => {
      req.body.email = 'email';
      req.body.password = 'pass1234';
      userService.getByEmailWithPassword.withArgs(req.body.email).resolves();
      authService.checkPassword.withArgs(req.body.password, user.password).resolves(true);
      authService.issueToken.withArgs(user).resolves(token);

      return expect(handler.login(req, res)).to.eventually.be.rejectedWith(
        InvalidError,
        'Invalid email or password'
      );
    });

    it('invalid password', () => {
      req.body.email = 'email';
      req.body.password = 'pass1234';
      userService.getByEmailWithPassword.withArgs(req.body.email).resolves(user);
      authService.checkPassword
        .withArgs(req.body.password, user.password)
        .resolves(false);
      authService.issueToken.withArgs(user).resolves(token);

      return expect(handler.login(req, res)).to.eventually.be.rejectedWith(
        InvalidError,
        'Invalid email or password'
      );
    });
  });

  describe('logout', () => {
    it('successfully went through', async () => {
      await handler.logout(req, res);
      expect(send).to.have.been.calledWith({
        data: {
          message: 'logged out'
        }
      });
    });
  });

  describe('forgotPassword', () => {
    it('successfully went through', async () => {
      req.body.email = 'email';
      userService.getByEmailWithPassword.withArgs(req.body.email).resolves(user);
      resetPassService.create.resolves();
      emailService.sendResetPassword.resolves();

      await handler.forgotPassword(req, res);

      expect(send).to.have.been.calledWith({
        data: {
          message: 'Email has been sent'
        }
      });
      expect(resetPassService.create.getCall(0).args[0].user_id).to.be.equal(user.id);
      expect(resetPassService.create.getCall(0).args[0].token).to.be.a('string');
      expect(emailService.sendResetPassword.getCall(0).args[0]).to.be.equal(user.email);
      expect(emailService.sendResetPassword.getCall(0).args[1]).to.be.a('string');
    });

    it('no user found with email', () => {
      req.body.email = 'email';
      userService.getByEmailWithPassword.withArgs(req.body.email).resolves();

      return expect(handler.forgotPassword(req, res)).to.be.eventually.rejectedWith(
        NotFoundError,
        `User not found with email: ${req.body.email}`
      );
    });
  });

  describe('updatePassword', () => {
    it('successfully went through', async () => {
      req.body.token = 'token';
      req.body.password = 'new-pass';
      resetPassService.completeResetPassword
        .withArgs(req.body.token, req.body.password)
        .resolves();

      await handler.updatePassword(req, res);

      expect(send).to.have.been.calledWith({
        data: {
          message: 'Password has been updated'
        }
      });
    });
  });

  describe('requiresLogIn', () => {
    it('successfully went through', () => {
      req.user_id = 'abc123';
      handler.requiresLogIn(req, res, next);
      return expect(next).to.be.calledOnceWith();
    });

    it('no user id in request', () => {
      req.user_id = undefined;
      handler.requiresLogIn(req, res, next);
      return expect(next).to.be.calledWith(sinon.match.instanceOf(UnauthorizedError));
    });
  });

  describe('requiresAdmin', () => {
    it('successfully went through', async () => {
      req.user_id = 'abc123';
      userService.getOneById.withArgs(req.user_id).resolves({ admin: true });
      await handler.requiresAdmin(req, res, next);
      expect(next).to.have.been.calledOnceWith();
    });

    it('no user id in request', async () => {
      req.user_id = undefined;
      await handler.requiresAdmin(req, res, next);
      expect(next).to.have.been.calledWith(sinon.match.instanceOf(UnauthorizedError));
    });

    it('user is not admin', async () => {
      req.user_id = 'abc123';
      userService.getOneById.withArgs(req.user_id).resolves({ admin: false });
      await handler.requiresAdmin(req, res, next);
      expect(next).to.have.been.calledWith(sinon.match.instanceOf(UnauthorizedError));
    });
  });
});
