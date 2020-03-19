import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import UserResolver from '../../../../src/infra/graphql/user/resolver';
import { UnauthorizedError } from '../../../../src/common/error/unauthorized';
import { InvalidError } from '../../../../src/common/error/invalid';
import { NotFoundError } from '../../../../src/common/error/notFound';

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
    id: 'id-1',
    email: 'email',
    first_name: 'fname',
    last_name: 'lname',
    password: 'password'
  };
  const token = 'token';

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
    it('get user and token', async () => {
      const input: any = {};
      dataSources.userService.create.withArgs(input).resolves(user);
      dataSources.authService.issueToken.withArgs(user).resolves(token);
      dataSources.emailService.sendWelcome
        .withArgs(user.email, user.first_name)
        .resolves();

      const result = await UserResolver.Mutation.signup(
        undefined,
        { input },
        { dataSources }
      );
      expect(result).to.be.deep.equal({
        token,
        user
      });
    });
  });

  describe('login', () => {
    it('get user and token', async () => {
      const input: any = { email: 'email', password: 'password' };
      dataSources.userService.getByEmailWithPassword.withArgs(input.email).resolves(user);
      dataSources.authService.checkPassword
        .withArgs(input.password, user.password)
        .resolves(true);
      dataSources.authService.issueToken.withArgs(user).resolves(token);

      const result = await UserResolver.Mutation.login(
        undefined,
        { input },
        { dataSources }
      );
      expect(result).to.be.deep.equal({
        token,
        user
      });
    });

    it('should throw error if no user is found', () => {
      const input: any = { email: 'email', password: 'password' };
      dataSources.userService.getByEmailWithPassword.withArgs(input.email).resolves();
      return expect(
        UserResolver.Mutation.login(undefined, { input }, { dataSources })
      ).to.eventually.be.rejectedWith(InvalidError, 'Invalid email or password');
    });
  });

  describe('updateUser', () => {
    it('updates user successfully', async () => {
      const input: any = {};
      dataSources.userService.update.withArgs(user.id, input).resolves();
      const result = await UserResolver.Mutation.updateUser(
        undefined,
        { input },
        { dataSources, user_id: user.id }
      );
      expect(result).to.be.deep.equal(user.id);
    });

    it('should throw error if no user_id is passed as argument', () => {
      const input: any = {};
      return expect(
        UserResolver.Mutation.updateUser(
          undefined,
          { input },
          { dataSources, user_id: undefined as any }
        )
      ).to.eventually.be.rejectedWith(UnauthorizedError, 'You are not authorized');
    });
  });

  describe('forgotPassword', () => {
    it('completes process successfully', async () => {
      const email = 'email';
      dataSources.userService.getByEmailWithPassword.withArgs(email).resolves(user);
      dataSources.resetPasswordService.create.resolves();
      dataSources.emailService.sendResetPassword.resolves();

      const result = await UserResolver.Mutation.forgotPassword(
        undefined,
        { email },
        { dataSources }
      );

      expect(result).to.be.equal('Email is sent');
      expect(dataSources.resetPasswordService.create.getCall(0).args[0]).to.have.property(
        'user_id',
        user.id
      );
      expect(dataSources.resetPasswordService.create.getCall(0).args[0])
        .to.have.property('token')
        .that.is.a('string');
      expect(dataSources.emailService.sendResetPassword.getCall(0).args[0]).to.be.equal(
        user.email
      );
      expect(dataSources.emailService.sendResetPassword.getCall(0).args[1]).to.be.a(
        'string'
      );
    });

    it('should throw error if no user is found', () => {
      const email = 'email';
      dataSources.userService.getByEmailWithPassword.withArgs(email).resolves();
      return expect(
        UserResolver.Mutation.forgotPassword(undefined, { email }, { dataSources })
      ).to.eventually.be.rejectedWith(
        NotFoundError,
        `User not found with email: ${email}`
      );
    });
  });

  describe('resetPassword', () => {
    it('updates password successfully', async () => {
      const password = 'new-pass';
      const input: any = { token, password };
      dataSources.resetPasswordService.completeResetPassword
        .withArgs(token, password)
        .resolves();
      const result = await UserResolver.Mutation.resetPassword(undefined, input, {
        dataSources
      });
      expect(result).to.be.equal('Password has been updated');
    });
  });
});
