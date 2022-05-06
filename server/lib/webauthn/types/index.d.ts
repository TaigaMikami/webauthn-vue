/**
 * A WebAuthn-compatible device and the information needed to verify assertions by it
 */
 export declare type AuthenticatorDevice = {
  credentialPublicKey: Buffer;
  credentialID: Buffer;
  counter: number;
  transports?: AuthenticatorTransport[];
};


export interface PublicKeyCredentialUserEntityJSON extends Omit<PublicKeyCredentialUserEntity, 'id'> {
  id: string;
}

export interface PublicKeyCredentialDescriptorJSON extends Omit<PublicKeyCredentialDescriptor, 'id'> {
  id: Base64URLString;
}

export declare type Base64URLString = string;

export interface PublicKeyCredentialCreationOptionsJSON extends Omit<PublicKeyCredentialCreationOptions, 'challenge' | 'user' | 'excludeCredentials'> {
  user: PublicKeyCredentialUserEntityJSON;
  challenge: Base64URLString;
  excludeCredentials: PublicKeyCredentialDescriptorJSON[];
  extensions?: AuthenticationExtensionsClientInputs;
}

/**
 * A slightly-modified RegistrationCredential to simplify working with ArrayBuffers that
 * are Base64URL-encoded in the browser so that they can be sent as JSON to the server.
 */
 export interface RegistrationCredentialJSON extends Omit<RegistrationCredential, 'response' | 'rawId' | 'getClientExtensionResults'> {
  rawId: Base64URLString;
  response: AuthenticatorAttestationResponseJSON;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  transports?: AuthenticatorTransport[];
}
 
/**
 * The value returned from navigator.credentials.create()
 */
 export interface RegistrationCredential extends PublicKeyCredential {
  response: AuthenticatorAttestationResponseFuture;
}

/**
 * A slightly-modified AuthenticatorAttestationResponse to simplify working with ArrayBuffers that
 * are Base64URL-encoded in the browser so that they can be sent as JSON to the server.
 */
 export interface AuthenticatorAttestationResponseJSON extends Omit<AuthenticatorAttestationResponseFuture, 'clientDataJSON' | 'attestationObject'> {
  clientDataJSON: Base64URLString;
  attestationObject: Base64URLString;
}

/**
 * AuthenticatorAttestationResponse in TypeScript's DOM lib is outdated (up through v3.9.7).
 * Maintain an augmented version here so we can implement additional properties as the WebAuthn
 * spec evolves.
 *
 * See https://www.w3.org/TR/webauthn-2/#iface-authenticatorattestationresponse
 *
 * Properties marked optional are not supported in all browsers.
 */
 export interface AuthenticatorAttestationResponseFuture extends AuthenticatorAttestationResponse {
  getTransports?: () => AuthenticatorTransport[];
  getAuthenticatorData?: () => ArrayBuffer;
  getPublicKey?: () => ArrayBuffer;
  getPublicKeyAlgorithm?: () => COSEAlgorithmIdentifier[];
}
