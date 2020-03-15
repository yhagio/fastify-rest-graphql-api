import { IAuthService } from '../../service/auth/interface';
import { IUserService, IUserAccount } from '../../service/user/interface';
import { IEmailService } from '../../service/email/interface';
import { IResetPasswordService } from '../../service/resetPassword/interface';

export interface IDataSources {
  authService: IAuthService;
  userService: IUserService;
  emailService: IEmailService;
  resetPasswordService: IResetPasswordService;
}

export interface IUserAndToken {
  user: IUserAccount;
  token: string;
}
