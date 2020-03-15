import { IUserAccount } from '../../../service/user/interface';
import { InvalidError } from '../../../common/error/invalid';
import { UnauthorizedError } from '../../../common/error/unauthorized';
import { generateRandomBytes } from '../../../common/token';
import { NotFoundError } from '../../../common/error/notFound';
import { IDataSources, IUserAndToken } from '../interface';
import { IUser } from '../../../domain/user';

const UserResolver = {
  Query: {
    async getUserById(
      parent: any,
      { id }: { id: string },
      { dataSources, user_id }: { dataSources: IDataSources; user_id: string }
    ): Promise<IUserAccount> {
      if (!user_id) {
        throw new UnauthorizedError('You are not authorized');
      }
      return dataSources.userService.getOneById(id);
    }
  },
  Mutation: {
    async signup(
      parent: any,
      { input }: { input: any },
      { dataSources }: { dataSources: IDataSources }
    ): Promise<IUserAndToken> {
      const user = await dataSources.userService.create(input);
      const token = await dataSources.authService.issueToken(user);
      await dataSources.emailService.sendWelcome(user.email, user.first_name);
      return {
        token,
        user
      };
    },

    async login(
      parent: any,
      { input: { email, password } }: { input: any },
      { dataSources }: { dataSources: IDataSources }
    ): Promise<IUserAndToken> {
      const user = await dataSources.userService.getByEmailWithPassword(email);
      if (
        !user ||
        !(await dataSources.authService.checkPassword(password, user.password))
      ) {
        throw new InvalidError('Invalid email or password');
      }
      const token = await dataSources.authService.issueToken(user);
      return {
        user,
        token
      };
    },

    async updateUser(
      parent: any,
      { input }: { input: Partial<IUser> },
      { dataSources, user_id }: { dataSources: IDataSources; user_id: string }
    ): Promise<string> {
      if (!user_id) {
        throw new UnauthorizedError('You are not authorized');
      }
      await dataSources.userService.update(user_id, input);
      return user_id;
    },

    async forgotPassword(
      parent: any,
      { email }: { email: string },
      { dataSources }: { dataSources: IDataSources }
    ): Promise<string> {
      const user = await dataSources.userService.getByEmailWithPassword(email);
      if (!user) {
        throw new NotFoundError(`User not found with email: ${email}`);
      }
      const token = generateRandomBytes();
      await dataSources.resetPasswordService.create({ user_id: user.id, token });
      await dataSources.emailService.sendResetPassword(user.email, token);
      return 'Email is sent';
    },

    async resetPassword(
      parent: any,
      { token, password }: { token: string; password: string },
      { dataSources }: { dataSources: IDataSources }
    ): Promise<string> {
      await dataSources.resetPasswordService.completeResetPassword(token, password);
      return 'Password has been updated';
    }
  }
};

export default UserResolver;
