import sinon from 'sinon';
import { expect } from 'chai';

import UserHandler from '../../src/handler/user';
import { UnauthorizedError } from '../../src/common/error/unauthorized';

describe('UserHandler', () => {
  const sandbox = sinon.createSandbox();
  const userService: any = {
    getOneById: sandbox.stub(),
    update: sandbox.stub()
  };
  let req: any = {};

  const send: any = sandbox.stub();
  const res: any = {
    code: sandbox.stub()
  };
  let handler: UserHandler;

  const user: any = {
    id: 'u1'
  };

  beforeEach(() => {
    res.code.withArgs(200).returns({ send });
    handler = new UserHandler(userService);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('getOneById', () => {
    it('get user', async () => {
      req.user_id = user.id;
      userService.getOneById.withArgs(req.user_id).resolves(user);

      await handler.getOneById(req, res);
      expect(send).to.have.been.calledWith({ data: { user } });
    });

    it('throws unauthorized error if no user in request', () => {
      req.user_id = undefined;

      return expect(handler.getOneById(req, res)).to.eventually.be.rejectedWith(
        UnauthorizedError,
        'You are not authorized'
      );
    });
  });

  describe('update', () => {
    it('updates user', async () => {
      req.user_id = user.id;
      req.body = user;
      userService.update.withArgs(req.user_id, req.body).resolves();

      await handler.update(req, res);
      expect(send).to.have.been.calledWith({ data: { user_id: user.id } });
    });

    it('throws unauthorized error if no user in request', () => {
      req.user_id = undefined;

      return expect(handler.update(req, res)).to.eventually.be.rejectedWith(
        UnauthorizedError,
        'You are not authorized'
      );
    });
  });
});
