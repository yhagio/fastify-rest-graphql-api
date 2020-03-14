import Fastify, { FastifyInstance } from 'fastify';
import helmet from 'fastify-helmet';
import cors from 'fastify-cors';
import config from 'config';
import { Server, IncomingMessage, ServerResponse } from 'http';
import MailgunClient from 'mailgun-js';
import Knex from 'knex';

import UserHandler from './handler/user';
import { ErrorHandler } from './handler/error';
import IConfig from './common/config';
import DB from './infra/db/knex';
import Mailgun from './infra/mailgun/mailgun';
import EmailService from './service/email/service';
import AuthService from './service/auth/service';
import UserService from './service/user/service';
import UserValidator from './service/user/validator';
import UserDataAccess from './dataAccess/user/db';
import ResetPasswordValidator from './service/resetPassword/validator';
import ResetPasswordDataAccess from './dataAccess/resetPassword/db';
import ResetPasswordService from './service/resetPassword/service';
import AuthHandler from './handler/auth';
import { SetUserToRequest } from './middlewares/auth';

const app: FastifyInstance<Server, IncomingMessage, ServerResponse> = Fastify({
  logger: true
});

const appConfig: IConfig = config;

// Setup middlewares
app.register(helmet);
app.register(cors, {
  origin: appConfig.get<string>('client_base_url'),
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
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

// Setup routes and assign handlers
app.get('/health', (req, res) => {
  res.send({ ok: true });
});

app.post('/api/auth/signup', {}, authHandler.signUp.bind(authHandler));
app.post('/api/auth/login', {}, authHandler.login.bind(authHandler));
app.post('/api/auth/logout', {}, authHandler.logout.bind(authHandler));
app.post('/api/auth/forgot_password', {}, authHandler.forgotPassword.bind(authHandler));
app.post('/api/auth/update_password', {}, authHandler.updatePassword.bind(authHandler));

// On every request
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
