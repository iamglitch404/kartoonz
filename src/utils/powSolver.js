const crypto = require('crypto');

function leadingZeroBits(buf) {
  let bits = 0;
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b === 0) {
      bits += 8;
      continue;
    }
    let mask = 0x80;
    while (mask && !(b & mask)) {
      bits++;
      mask >>= 1;
    }
    break;
  }
  return bits;
}

function solveProofOfWork(nonce, bits, max = 10000000) {
  const prefix = `${nonce}:`;
  const t0 = Date.now();

  for (let i = 0; i < max; i++) {
    const hash = crypto.createHash('sha256').update(prefix + i).digest();
    if (leadingZeroBits(hash) >= bits) {
      return {
        solution: String(i),
        durationMs: Date.now() - t0
      };
    }
  }

  throw new Error('pow solver exceeded max iterations');
}

module.exports = { solveProofOfWork, leadingZeroBits };
