export interface IResetPassword {
  id?: string;
  user_id: string;
  token: string;
  created_at?: Date;
}
