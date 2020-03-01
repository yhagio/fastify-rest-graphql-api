import { FastifyRequest, FastifyReply } from 'fastify';
import { ServerResponse } from 'http';
import { UnauthorizedError } from '../common/error/unauthorized';
import { IUserService } from '../service/user/interface';

export default class UserHandler {
  constructor(private userService: IUserService) { }

  async getOneById(req: FastifyRequest, res: FastifyReply<ServerResponse>): Promise<void> {
    if (!(req as any).user_id) {
      throw new UnauthorizedError('You are not authorized');
    }
    const user = await this.userService.getOneById((req as any).user_id);
    res.code(200).send({ user });
  }

  async update(req: FastifyRequest, res: FastifyReply<ServerResponse>): Promise<void> {
    if (!(req as any).user_id) {
      throw new UnauthorizedError('You are not authorized');
    }
    await this.userService.update((req as any).user_id, req.body);
    res.code(200).send({ user_id: (req as any).user_id });
  }
}
