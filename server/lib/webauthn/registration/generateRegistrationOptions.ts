import base64url from 'base64url';
import type { PublicKeyCredentialCreationOptionsJSON } from "../types";
import generateChallenge from '../helpers/generateChallenge';

export type GenerateRegistrationOptionsOpts = {
  rpName: string;
  rpID: string;
  userID: string;
  userName: string;
  challenge?: string | Buffer;
  userDisplayName?: string;
  timeout?: number;
  attestationType?: AttestationConveyancePreference;
  excludeCredentials?: PublicKeyCredentialDescriptor[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  extensions?: AuthenticationExtensionsClientInputs;
  supportedAlgorithmIDs?: COSEAlgorithmIdentifier[];
};

export const supportedCOSEAlgorithmIdentifiers: COSEAlgorithmIdentifier[] = [
  // ECDSA w/ SHA-256
  -7,
  // EdDSA
  -8,
  // ECDSA w/ SHA-512
  -36,
  // RSASSA-PSS w/ SHA-256
  -37,
  // RSASSA-PSS w/ SHA-384
  -38,
  // RSASSA-PSS w/ SHA-512
  -39,
  // RSASSA-PKCS1-v1_5 w/ SHA-256
  -257,
  // RSASSA-PKCS1-v1_5 w/ SHA-384
  -258,
  // RSASSA-PKCS1-v1_5 w/ SHA-512
  -259,
  // RSASSA-PKCS1-v1_5 w/ SHA-1 (Deprecated; here for legacy support)
  -65535,
];

const defaultAuthenticatorSelection: AuthenticatorSelectionCriteria = {
  requireResidentKey: false,
  userVerification: 'preferred',
};

const defaultSupportedAlgorithmIDs = supportedCOSEAlgorithmIdentifiers.filter(id => id !== -65535);

export function generateRegistrationOptions(
  options: GenerateRegistrationOptionsOpts,
): PublicKeyCredentialCreationOptionsJSON {
  const {
    rpName,
    rpID,
    userID,
    userName,
    challenge = generateChallenge(),
    userDisplayName = userName,
    timeout = 60000,
    attestationType = 'none',
    excludeCredentials = [],
    authenticatorSelection = defaultAuthenticatorSelection,
    extensions,
    supportedAlgorithmIDs = defaultSupportedAlgorithmIDs,
  } = options;

  /**
   * Prepare pubKeyCredParams from the array of algorithm ID's
   */
  const pubKeyCredParams: PublicKeyCredentialParameters[] = supportedAlgorithmIDs.map(id => ({
    alg: id,
    type: 'public-key',
  }));

  /**
   * "Relying Parties SHOULD set [requireResidentKey] to true if, and only if, residentKey is set
   * to "required""
   *
   * See https://www.w3.org/TR/webauthn-2/#dom-authenticatorselectioncriteria-requireresidentkey
   */
  if (authenticatorSelection.residentKey === 'required') {
    authenticatorSelection.requireResidentKey = true;
  } else {
    authenticatorSelection.requireResidentKey = false;
  }

  return {
    challenge: base64url.encode(challenge),
    rp: {
      name: rpName,
      id: rpID,
    },
    user: {
      id: userID,
      name: userName,
      displayName: userDisplayName,
    },
    pubKeyCredParams,
    timeout,
    attestation: attestationType,
    excludeCredentials: excludeCredentials.map(cred => ({
      ...cred,
      id: base64url.encode(cred.id as Buffer),
    })),
    authenticatorSelection,
    extensions,
  };
}
