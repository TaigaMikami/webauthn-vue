export interface PublicKeyCredentialCreationOptionsJSON
  extends Omit<
    PublicKeyCredentialCreationOptions,
    "challenge" | "user" | "excludeCredentials"
  > {
  user: PublicKeyCredentialUserEntityJSON;
  challenge: Base64URLString;
  excludeCredentials: PublicKeyCredentialDescriptorJSON[];
  extensions?: AuthenticationExtensionsClientInputs;
}

export interface PublicKeyCredentialUserEntityJSON
  extends Omit<PublicKeyCredentialUserEntity, "id"> {
  id: string;
}

export declare type Base64URLString = string;

export interface PublicKeyCredentialDescriptorJSON
  extends Omit<PublicKeyCredentialDescriptor, "id"> {
  id: Base64URLString;
}

export interface RegistrationCredential extends PublicKeyCredential {
  response: AuthenticatorAttestationResponseFuture;
}

export interface AuthenticatorAttestationResponseFuture
  extends AuthenticatorAttestationResponse {
  getTransports?: () => AuthenticatorTransport[];
  getAuthenticatorData?: () => ArrayBuffer;
  getPublicKey?: () => ArrayBuffer;
  getPublicKeyAlgorithm?: () => COSEAlgorithmIdentifier[];
}

export interface RegistrationCredentialJSON
  extends Omit<
    RegistrationCredential,
    "response" | "rawId" | "getClientExtensionResults"
  > {
  rawId: Base64URLString;
  response: AuthenticatorAttestationResponseJSON;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  transports?: AuthenticatorTransport[];
}

export interface AuthenticatorAttestationResponseJSON
  extends Omit<
    AuthenticatorAttestationResponseFuture,
    "clientDataJSON" | "attestationObject"
  > {
  clientDataJSON: Base64URLString;
  attestationObject: Base64URLString;
}

// authentication
export interface PublicKeyCredentialRequestOptionsJSON
  extends Omit<
    PublicKeyCredentialRequestOptions,
    "challenge" | "allowCredentials"
  > {
  challenge: Base64URLString;
  allowCredentials?: PublicKeyCredentialDescriptorJSON[];
  extensions?: AuthenticationExtensionsClientInputs;
}

export interface AuthenticationCredential extends PublicKeyCredential {
  response: AuthenticatorAssertionResponse;
}

export interface AuthenticatorAttestationResponseJSON
  extends Omit<
    AuthenticatorAttestationResponseFuture,
    "clientDataJSON" | "attestationObject"
  > {
  clientDataJSON: Base64URLString;
  attestationObject: Base64URLString;
}

export interface AuthenticatorAssertionResponseJSON
  extends Omit<
    AuthenticatorAssertionResponse,
    "authenticatorData" | "clientDataJSON" | "signature" | "userHandle"
  > {
  authenticatorData: Base64URLString;
  clientDataJSON: Base64URLString;
  signature: Base64URLString;
  userHandle?: string;
}

export interface AuthenticationCredentialJSON
  extends Omit<
    AuthenticationCredential,
    "response" | "rawId" | "getClientExtensionResults"
  > {
  rawId: Base64URLString;
  response: AuthenticatorAssertionResponseJSON;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
}
