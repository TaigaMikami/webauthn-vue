import base64url from "base64url";
import { RegistrationCredentialJSON } from "../types";
import decodeAttestationObject, { AttestationFormat, AttestationStatement } from "../helpers/decodeAttestationObject";
import { supportedCOSEAlgorithmIdentifiers } from './generateRegistrationOptions';
import decodeClientDataJSON from "../helpers/decodeClientDataJSON";
import parseAuthenticatorData from "../helpers/parseAuthenticatorData";
import toHash from "../helpers/toHash";
import decodeCredentialPublicKey from "../helpers/decodeCredentialPublicKey";
import { COSEKEYS } from '../helpers/convertCOSEtoPKCS';
import settingsService from "../services/settingsService";
import verifyFIDOU2F from "./verifications/verifyFIDOU2F";
import verifyAndroidSafetynet from './verifications/verifyAndroidSafetyNet';
import verifyApple from "./verifications/verifyApple";
import convertAAGUIDToString from "../helpers/convertAAGUIDToString";
import verifyPacked from "./verifications/verifyPacked";
import verifyAndroidKey from "./verifications/verifyAndroidKey";

export type VerifiedRegistrationResponse = {
  verified: boolean;
  registrationInfo?: {
    fmt: AttestationFormat;
    counter: number;
    aaguid: string;
    credentialPublicKey: Buffer;
    credentialID: Buffer;
    credentialType: string;
    userVerified: boolean;
    attestationObject: Buffer;
  };
};

export type VerifyRegistrationResponseOpts = {
  credential: RegistrationCredentialJSON;
  expectedChallenge: string | ((challenge: string) => boolean);
  expectedOrigin: string | string[];
  expectedRPID?: string | string[];
  requireUserVerification?: boolean;
  supportedAlgorithmIDs?: COSEAlgorithmIdentifier[];
};

/**
 * Values passed to all attestation format verifiers, from which they are free to use as they please
 */
 export type AttestationFormatVerifierOpts = {
  aaguid: Buffer;
  attStmt: AttestationStatement;
  authData: Buffer;
  clientDataHash: Buffer;
  credentialID: Buffer;
  credentialPublicKey: Buffer;
  rootCertificates: string[];
  rpIdHash: Buffer;
  verifyTimestampMS?: boolean;
};

export default async function verifyRegistrationResponse(
  options: VerifyRegistrationResponseOpts,
): Promise<VerifiedRegistrationResponse> {
  const {
    credential,
    expectedChallenge,
    expectedOrigin,
    expectedRPID,
    requireUserVerification = false,
    supportedAlgorithmIDs = supportedCOSEAlgorithmIdentifiers,
  } = options;
  const { id, rawId, type: credentialType, response } = credential;

  // Ensure credential specified an ID
  if (!id) {
    throw new Error('Missing credential ID');
  }

  // Ensure ID is base64url-encoded
  if (id !== rawId) {
    throw new Error('Credential ID was not base64url-encoded');
  }

  // Make sure credential type is public-key
  if (credentialType !== 'public-key') {
    throw new Error(`Unexpected credential type ${credentialType}, expected "public-key"`);
  }

  const clientDataJSON = decodeClientDataJSON(response.clientDataJSON);

  const { type, origin, challenge, tokenBinding } = clientDataJSON;

  // Make sure we're handling an registration
  if (type !== 'webauthn.create') {
    throw new Error(`Unexpected registration response type: ${type}`);
  }

  // Ensure the device provided the challenge we gave it
  if (typeof expectedChallenge === 'function') {
    if (!expectedChallenge(challenge)) {
      throw new Error(
        `Custom challenge verifier returned false for registration response challenge "${challenge}"`,
      );
    }
  } else if (challenge !== expectedChallenge) {
    throw new Error(
      `Unexpected registration response challenge "${challenge}", expected "${expectedChallenge}"`,
    );
  }

  // Check that the origin is our site
  if (Array.isArray(expectedOrigin)) {
    if (!expectedOrigin.includes(origin)) {
      throw new Error(
        `Unexpected registration response origin "${origin}", expected one of: ${expectedOrigin.join(
          ', ',
        )}`,
      );
    }
  } else {
    if (origin !== expectedOrigin) {
      throw new Error(
        `Unexpected registration response origin "${origin}", expected "${expectedOrigin}"`,
      );
    }
  }

  if (tokenBinding) {
    if (typeof tokenBinding !== 'object') {
      throw new Error(`Unexpected value for TokenBinding "${tokenBinding}"`);
    }

    if (['present', 'supported', 'not-supported'].indexOf(tokenBinding.status) < 0) {
      throw new Error(`Unexpected tokenBinding.status value of "${tokenBinding.status}"`);
    }
  }

  const attestationObject = base64url.toBuffer(response.attestationObject);
  const decodedAttestationObject = decodeAttestationObject(attestationObject);
  const { fmt, authData, attStmt } = decodedAttestationObject;

  const parsedAuthData = parseAuthenticatorData(authData);
  const { aaguid, rpIdHash, flags, credentialID, counter, credentialPublicKey } = parsedAuthData;

  // Make sure the response's RP ID is ours
  if (expectedRPID) {
    if (typeof expectedRPID === 'string') {
      const expectedRPIDHash = toHash(Buffer.from(expectedRPID, 'ascii'));
      if (!rpIdHash.equals(expectedRPIDHash)) {
        throw new Error(`Unexpected RP ID hash`);
      }
    } else {
      // Go through each expected RP ID and try to find one that matches
      const foundMatch = expectedRPID.some(expected => {
        const expectedRPIDHash = toHash(Buffer.from(expected, 'ascii'));
        return rpIdHash.equals(expectedRPIDHash);
      });

      if (!foundMatch) {
        throw new Error(`Unexpected RP ID hash`);
      }
    }
  }

  // Make sure someone was physically present
  if (!flags.up) {
    throw new Error('User not present during registration');
  }

  // Enforce user verification if specified
  if (requireUserVerification && !flags.uv) {
    throw new Error('User verification required, but user could not be verified');
  }

  if (!credentialID) {
    throw new Error('No credential ID was provided by authenticator');
  }

  if (!credentialPublicKey) {
    throw new Error('No public key was provided by authenticator');
  }

  if (!aaguid) {
    throw new Error('No AAGUID was present during registration');
  }

  const decodedPublicKey = decodeCredentialPublicKey(credentialPublicKey);
  const alg = decodedPublicKey.get(COSEKEYS.alg);

  if (typeof alg !== 'number') {
    throw new Error('Credential public key was missing numeric alg');
  }

  // Make sure the key algorithm is one we specified within the registration options
  if (!supportedAlgorithmIDs.includes(alg as number)) {
    const supported = supportedAlgorithmIDs.join(', ');
    throw new Error(`Unexpected public key alg "${alg}", expected one of "${supported}"`);
  }

  const clientDataHash = toHash(base64url.toBuffer(response.clientDataJSON));
  const rootCertificates = settingsService.getRootCertificates({ identifier: fmt });

  // Prepare arguments to pass to the relevant verification method
  const verifierOpts: AttestationFormatVerifierOpts = {
    aaguid,
    attStmt,
    authData,
    clientDataHash,
    credentialID,
    credentialPublicKey,
    rootCertificates,
    rpIdHash,
  };

  /**
   * Verification can only be performed when attestation = 'direct'
   */
  let verified = false;
  if (fmt === 'fido-u2f') {
    verified = await verifyFIDOU2F(verifierOpts);
  } else if (fmt === 'packed') {
    verified = await verifyPacked(verifierOpts);
  } else if (fmt === 'android-safetynet') {
    verified = await verifyAndroidSafetynet(verifierOpts);
  } else if (fmt === 'android-key') {
    verified = await verifyAndroidKey(verifierOpts);
  //TODO: } else if (fmt === 'tpm') {
  //   verified = await verifyTPM(verifierOpts);
  } else if (fmt === 'apple') {
    verified = await verifyApple(verifierOpts);
  } else if (fmt === 'none') {
    if (Object.keys(attStmt).length > 0) {
      throw new Error('None attestation had unexpected attestation statement');
    }
    // This is the weaker of the attestations, so there's nothing else to really check
    verified = true;
  } else {
    throw new Error(`Unsupported Attestation Format: ${fmt}`);
  }

  const toReturn: VerifiedRegistrationResponse = {
    verified,
  };

  if (toReturn.verified) {
    toReturn.registrationInfo = {
      fmt,
      counter,
      aaguid: convertAAGUIDToString(aaguid),
      credentialPublicKey,
      credentialID,
      credentialType,
      userVerified: flags.uv,
      attestationObject,
    };
  }

  return toReturn;
}
