import bcrypt from 'bcryptjs';

export const hashString = async (str: string): Promise<string> => {
  return bcrypt.hash(str, 10);
};
