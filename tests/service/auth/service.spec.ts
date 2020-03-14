import sinon from 'sinon';
import { expect } from 'chai';
import bcrypt from 'bcryptjs';

import AuthService from '../../../src/service/auth/service';
import { IUserAccount } from '../../../src/service/user/interface';

describe('AuthService', () => {
  const sandbox = sinon.createSandbox();
  const config: any = {
    get: sandbox.stub()
  };
  let authService: AuthService;

  const userAccount: IUserAccount = {
    id: '123abc',
    email: 'alice@cc.cc',
    admin: true,
    first_name: 'alice',
    last_name: 'smith'
  };

  beforeEach(() => {
    config.get.withArgs('infra.jwt.secret').returns('secret');
    config.get.withArgs('infra.jwt.expiresin').returns('1d');
    authService = new AuthService(config);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('checkPassword', () => {
    it('should be true if passwords match', async () => {
      const hashed = await bcrypt.hash('test1234', 10);
      const result = await authService.checkPassword('test1234', hashed);
      expect(result).to.be.true;
    });

    it('should be false if passwords do not match', async () => {
      const result = await authService.checkPassword('test1234', 'test1234');
      expect(result).to.be.not.true;
    });
  });

  describe('issueToken', () => {
    it('should issue token given user', () => {
      const token = authService.issueToken(userAccount);
      expect(typeof token).to.be.equal('string');
    });
  });

  describe('verifyToken', () => {
    it('should decode given token if valid', async () => {
      const _token = authService.issueToken(userAccount);
      const token = await authService.verifyToken(_token);
      expect(token).to.have.property('id', userAccount.id);
      expect(token).to.have.property('first_name', userAccount.first_name);
      expect(token).to.have.property('email', userAccount.email);
      expect(token)
        .to.have.property('iat')
        .that.is.a('number');
      expect(token)
        .to.have.property('exp')
        .that.is.a('number');
    });
  });
});
