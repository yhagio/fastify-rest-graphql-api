import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import UserResolver from '../../../../src/infra/graphql/user/resolver';
import { UnauthorizedError } from '../../../../src/common/error/unauthorized';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('UserResolver', () => {
  const sandbox = sinon.createSandbox();

  const dataSources: any = {
    userService: {
      getOneById: sandbox.stub(),
      create: sandbox.stub(),
      getByEmailWithPassword: sandbox.stub(),
      update: sandbox.stub()
    },
    resetPasswordService: {
      create: sandbox.stub(),
      completeResetPassword: sandbox.stub()
    },
    authService: {
      issueToken: sandbox.stub(),
      checkPassword: sandbox.stub()
    },
    emailService: {
      sendWelcome: sandbox.stub(),
      sendResetPassword: sandbox.stub()
    }
  };

  const user: any = {
    id: 'id-1'
  };

  beforeEach(() => {});

  afterEach(() => {
    sandbox.reset();
  });

  describe('getUserById', () => {
    it('get user', async () => {
      dataSources.userService.getOneById.withArgs(user.id).resolves(user);

      const result = await UserResolver.Query.getUserById(
        undefined,
        { id: user.id },
        { dataSources, user_id: user.id }
      );
      expect(result).to.be.deep.equal(user);
    });

    it('throws error if no id is passed as argument', () => {
      return expect(
        UserResolver.Query.getUserById(
          undefined,
          { id: user.id },
          { dataSources, user_id: undefined as any }
        )
      ).to.eventually.be.rejectedWith(UnauthorizedError, 'You are not authorized');
    });
  });

  describe('signup', () => {
    it('get user and token');
  });

  describe('login', () => {
    it('get user and token');
    it('should throw error if no user is found');
  });

  describe('updateUser', () => {
    it('updates user successfully');
    it('should throw error if no user_id is passed as argument');
  });

  describe('forgotPassword', () => {
    it('completes process successfully');
    it('should throw error if no user is found');
  });

  describe('resetPassword', () => {
    it('updates password successfully');
  });
});
