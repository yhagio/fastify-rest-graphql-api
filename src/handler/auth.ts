import { IUserService } from '../service/user/interface';
import { IEmailService } from '../service/email/interface';
import { IAuthService } from '../service/auth/interface';
import { IResetPasswordService } from '../service/resetPassword/interface';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ServerResponse } from 'http';
import { generateRandomBytes } from '../common/token';
import { NotFoundError } from '../common/error/notFound';
import { UnauthorizedError } from '../common/error/unauthorized';
import { InvalidError } from '../common/error/invalid';

export default class AuthHandler {
  constructor(
    private readonly authService: IAuthService,
    private readonly userService: IUserService,
    private readonly emailService: IEmailService,
    private readonly resetPassService: IResetPasswordService
  ) {}

  async signUp(req: FastifyRequest, res: FastifyReply<ServerResponse>): Promise<void> {
    const newUser = await this.userService.create(req.body);
    const token = await this.authService.issueToken(newUser);
    res.code(200).send({ user: newUser, token });
    await this.emailService.sendWelcome(newUser.email, newUser.first_name);
  }

  async login(req: FastifyRequest, res: FastifyReply<ServerResponse>): Promise<void> {
    const user = await this.userService.getByEmailWithPassword(req.body.email);
    if (!user || !this.authService.checkPassword(req.body.password, user.password)) {
      throw new InvalidError('Invalid email or password');
    }
    const token = await this.authService.issueToken(user);
    const { password: _, ...rest } = user;
    res.code(200).send({ token, user: { ...rest } });
  }

  async logout(req: FastifyRequest, res: FastifyReply<ServerResponse>): Promise<void> {
    res.code(200).send({ message: 'logged out' });
  }

  async forgotPassword(
    req: FastifyRequest,
    res: FastifyReply<ServerResponse>
  ): Promise<void> {
    const { email }: { email: string } = req.body;
    const user = await this.userService.getByEmailWithPassword(email);
    if (!user) {
      throw new NotFoundError(`User not found with email: ${email}`);
    }
    const token = generateRandomBytes();
    await this.resetPassService.create({ user_id: user.id, token });
    res.code(200).send({ message: 'Email is sent' });
    await this.emailService.sendResetPassword(user.email, token);
  }

  async updatePassword(
    req: FastifyRequest,
    res: FastifyReply<ServerResponse>
  ): Promise<void> {
    const { token, password }: { token: string; password: string } = req.body;
    await this.resetPassService.completeResetPassword(token, password);
    res.code(200).send({ message: 'Done' });
  }

  async requiresLogIn(
    req: FastifyRequest,
    res: FastifyReply<ServerResponse>,
    next: (err?: Error | undefined) => void
  ): Promise<void> {
    if ((req as any).user_id) {
      next();
    } else {
      next(new UnauthorizedError('You need to login'));
    }
  }

  async requiresAdmin(
    req: FastifyRequest,
    res: FastifyReply<ServerResponse>,
    next: (err?: Error | undefined) => void
  ): Promise<void> {
    if ((req as any).user_id) {
      const { admin } = await this.userService.getOneById((req as any).user_id);
      if (admin === true) {
        next();
      } else {
        next(new UnauthorizedError('You are not authorized'));
      }
    } else {
      next(new UnauthorizedError('You need to login'));
    }
  }
}
