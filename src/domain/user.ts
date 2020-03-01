export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean;
  active: boolean;
  // Don't expose below
  password: string;
  token: string;
  customer_token: string;
  created_at: Date;
  updated_at: Date;
}
