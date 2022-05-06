import cbor from "cbor";

export type AttestationFormat =
| 'fido-u2f'
| 'packed'
| 'android-safetynet'
| 'android-key'
| 'tpm'
| 'apple'
| 'none';

export type AttestationObject = {
  fmt: AttestationFormat;
  attStmt: AttestationStatement;
  authData: Buffer;
};

export type AttestationStatement = {
  sig?: Buffer;
  x5c?: Buffer[];
  response?: Buffer;
  alg?: number;
  ver?: string;
  certInfo?: Buffer;
  pubArea?: Buffer;
};

/**
 * Convert an AttestationObject buffer to a proper object
 *
 * @param base64AttestationObject Attestation Object buffer
 */
 export default function decodeAttestationObject(attestationObject: Buffer): AttestationObject {
  const toCBOR: AttestationObject = cbor.decodeAllSync(attestationObject)[0];
  return toCBOR;
}
