import 'server-only';

import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

export const isBcryptPasswordHash = (password: string) => BCRYPT_HASH_PATTERN.test(password);

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);

export async function verifyPassword(password: string, storedPassword: string) {
  if (isBcryptPasswordHash(storedPassword)) {
    return bcrypt.compare(password, storedPassword);
  }

  return storedPassword === password;
}

