import Fastify, { FastifyInstance } from 'fastify';
import helmet from 'fastify-helmet';
import cors from 'fastify-cors';
import config from 'config';
import { Server, IncomingMessage, ServerResponse } from 'http';
import MailgunClient from 'mailgun-js';
import Knex from 'knex';
import { ApolloServer } from 'apollo-server-fastify';

import { SetUserToRequest } from './middlewares/auth';
import UserHandler from './handler/user';
import { ErrorHandler } from './handler/error';
import AuthHandler from './handler/auth';
import IConfig from './common/config';
import EmailService from './service/email/service';
import AuthService from './service/auth/service';
import UserService from './service/user/service';
import UserValidator from './service/user/validator';
import ResetPasswordValidator from './service/resetPassword/validator';
import ResetPasswordService from './service/resetPassword/service';
import ResetPasswordDataAccess from './dataAccess/resetPassword/db';
import UserDataAccess from './dataAccess/user/db';
import DB from './infra/db/knex';
import Mailgun from './infra/mailgun/mailgun';
import { typeDefs, resolvers } from './infra/graphql/schema-creator';

const appConfig: IConfig = config;

const app: FastifyInstance<Server, IncomingMessage, ServerResponse> = Fastify({
  logger: {
    level: appConfig.get('logLevel')
  }
});

app.register(require('fastify-swagger'), {
  routePrefix: '/docs',
  exposeRoute: true,
  mode: 'static',
  specification: {
    path: './src/swagger.yaml'
  }
});

// Setup middlewares
app.register(helmet);
app.register(cors, {
  origin: [appConfig.get<string>('client_base_url'), 'http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  preflightContinue: true,
  optionsSuccessStatus: 204,
  credentials: true
});

// Instantiates controllers, services, etc
const knexConn = new DB(Knex, appConfig).getConnection();
const mailgun = new Mailgun(MailgunClient, appConfig).getConnection();

const emailService = new EmailService(mailgun, appConfig);
const authService = new AuthService(appConfig);
const userService = new UserService(new UserValidator(new UserDataAccess(knexConn)));
const resetPasswordService = new ResetPasswordService(
  knexConn,
  userService,
  new ResetPasswordValidator(new ResetPasswordDataAccess(knexConn))
);

const authHandler = new AuthHandler(
  authService,
  userService,
  emailService,
  resetPasswordService
);
const userHandler = new UserHandler(userService);

// ===== GraphQL Server (Apollo Server) setup =====
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: { req: any }) => {
    let user_id = '';

    let authToken: string = req.headers?.authorization;
    if (authToken?.indexOf('Bearer') >= 0) {
      authToken = authToken.replace('Bearer ', '');
      // TODO: What if verifyToken throws error?
      const { id } = await authService.verifyToken(authToken);
      user_id = id;
    }
    return { user_id };
  },
  dataSources: (): any => ({
    authService,
    userService,
    emailService,
    resetPasswordService
  }),
  // DISABLE BELOW in real production
  introspection: true,
  playground: true
});
app.register(server.createHandler());

// ===== Setup routes and assign handlers =====
app.get('/health', {}, (req, res) => {
  res.send({ data: { ok: true } });
});

app.post('/api/auth/signup', {}, authHandler.signUp.bind(authHandler));
app.post('/api/auth/login', {}, authHandler.login.bind(authHandler));
app.post('/api/auth/logout', {}, authHandler.logout.bind(authHandler));
app.post('/api/auth/forgot_password', {}, authHandler.forgotPassword.bind(authHandler));
app.post('/api/auth/update_password', {}, authHandler.updatePassword.bind(authHandler));

// ===== On every request =====
app.addHook('onRequest', async (req, res) => SetUserToRequest(req, res, authService));

app.get(
  '/api/account',
  { preValidation: [authHandler.requiresLogIn] },
  userHandler.getOneById.bind(userHandler)
);
app.put(
  '/api/account',
  { preValidation: [authHandler.requiresLogIn] },
  userHandler.update.bind(userHandler)
);

app.setErrorHandler(ErrorHandler);

export default app;
