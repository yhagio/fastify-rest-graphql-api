import sinon from 'sinon';
import { expect } from 'chai';
import bcrypt from 'bcryptjs';

import AuthService from '../../../src/service/auth/service';

describe('AuthService', () => {
  const sandbox = sinon.createSandbox();
  const config: any = {
    get: sandbox.stub()
  };
  let authService: AuthService;

  beforeEach(() => {
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
    it('should issue token given user');
  });

  describe('verifyToken', () => {
    it('should decode given token if valid');
  });
});
