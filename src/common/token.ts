import crypto from 'crypto';

export const generateRandomBytes = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
