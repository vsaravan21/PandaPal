const crypto = require('crypto');

module.exports = {
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  CryptoEncoding: { HEX: 'hex' },
  digestStringAsync: async (algorithm, data, options) => {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash;
  },
};
