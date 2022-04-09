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
