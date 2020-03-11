import { FastifyRequest, FastifyReply } from 'fastify';
import { ServerResponse } from 'http';
import { IAuthService } from '../service/auth/interface';

export const SetUserToRequest = async (
  req: FastifyRequest,
  res: FastifyReply<ServerResponse>,
  authService: IAuthService
) => {
  let authToken: string = req.headers?.authorization;
  if (authToken?.indexOf('Bearer') >= 0) {
    authToken = authToken.replace('Bearer ', '');
    const { id } = await authService.verifyToken(authToken);
    (req as any).user_id = id;
  }
  return;
};
