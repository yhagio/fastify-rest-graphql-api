import sinon from 'sinon';
import { expect } from 'chai';

import { SetUserToRequest } from '../../src/middlewares/auth';

describe('AuthMiddleware', () => {
  const sandbox = sinon.createSandbox();
  let req: any;
  const res: any = {};
  const authService: any = {
    verifyToken: sandbox.stub()
  };

  const token = 'Bearer token';
  const userId = 'user-123';

  beforeEach(() => {
    req = {
      headers: {}
    };
    authService.verifyToken.withArgs('token').resolves({ id: userId });
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('SetUserToRequest', () => {
    it('set req.user_id if auth token is passed in headers, with Bearer', async () => {
      req.headers.authorization = token;
      await SetUserToRequest(req, res, authService);
      expect(req.user_id).to.be.equal(userId);
    });

    it('set req.user_id if auth token is passed in headers', async () => {
      req.headers.authorization = 'token';
      await SetUserToRequest(req, res, authService);
      return expect(req.user_id).to.be.equal(userId);
    });

    it('set no req.user_id if no headers', async () => {
      req.headers = undefined;
      await SetUserToRequest(req, res, authService);
      return expect(req.user_id).to.be.undefined;
    });

    it('set no req.user_id if no auth token is passed in headers', async () => {
      req.headers.authorization = undefined;
      await SetUserToRequest(req, res, authService);
      return expect(req.user_id).to.be.undefined;
    });

    it('set no req.user_id if no valid auth token is passed in headers', async () => {
      req.headers.authorization = 'dfdsfsf';
      await SetUserToRequest(req, res, authService);
      return expect(req.user_id).to.be.undefined;
    });
  });
});
