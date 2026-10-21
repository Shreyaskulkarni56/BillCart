// Cloudflare Workers shim for iconv-lite using native Web TextDecoder / TextEncoder
class TextDecoderWrapper {
  constructor(encoding) {
    this.encoding = encoding || 'utf-8';
    try {
      this.decoder = new TextDecoder(this.encoding);
    } catch {
      this.decoder = new TextDecoder('utf-8');
    }
  }

  write(buf) {
    if (!buf) return '';
    return this.decoder.decode(buf, { stream: true });
  }

  end() {
    return this.decoder.decode();
  }
}

class TextEncoderWrapper {
  constructor(encoding) {
    this.encoder = new TextEncoder();
  }

  write(str) {
    if (!str) return Buffer.alloc(0);
    return Buffer.from(this.encoder.encode(str));
  }

  end() {
    return Buffer.alloc(0);
  }
}

const iconv = {
  encodingExists(enc) {
    if (!enc) return false;
    try {
      new TextDecoder(enc);
      return true;
    } catch {
      return false;
    }
  },

  getDecoder(enc) {
    return new TextDecoderWrapper(enc);
  },

  getEncoder(enc) {
    return new TextEncoderWrapper(enc);
  },

  decode(buf, enc) {
    if (typeof buf === 'string') return buf;
    try {
      return new TextDecoder(enc || 'utf-8').decode(buf);
    } catch {
      return Buffer.isBuffer(buf) ? buf.toString() : String(buf);
    }
  },

  encode(str, enc) {
    if (Buffer.isBuffer(str)) return str;
    return Buffer.from(String(str || ''), enc || 'utf-8');
  }
};

module.exports = iconv;
module.exports.default = iconv;
