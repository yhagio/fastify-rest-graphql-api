import Bcrypto from 'bcryptjs';

export const hashString = async (str: string): Promise<string> => {
  return Bcrypto.hash(str, 10);
};
