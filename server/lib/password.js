const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const isBcryptHash = (value) =>
  typeof value === 'string' && value.startsWith('$2');

const hashPassword = async (plain) => bcrypt.hash(plain, SALT_ROUNDS);

const verifyPassword = async (plain, stored) => {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
};

module.exports = { hashPassword, verifyPassword, isBcryptHash };
