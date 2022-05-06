import base64url from "base64url";
import { Base64URLString } from "../types";

/**
 * Convert buffer to an OpenSSL-compatible PEM text format.
 */
 export default function convertCertBufferToPEM(certBuffer: Buffer | Base64URLString): string {
  let buffer: Buffer;
  if (typeof certBuffer === 'string') {
    buffer = base64url.toBuffer(certBuffer);
  } else {
    buffer = certBuffer;
  }

  const b64cert = buffer.toString('base64');

  let PEMKey = '';
  for (let i = 0; i < Math.ceil(b64cert.length / 64); i += 1) {
    const start = 64 * i;

    PEMKey += `${b64cert.substr(start, 64)}\n`;
  }

  PEMKey = `-----BEGIN CERTIFICATE-----\n${PEMKey}-----END CERTIFICATE-----\n`;

  return PEMKey;
}
