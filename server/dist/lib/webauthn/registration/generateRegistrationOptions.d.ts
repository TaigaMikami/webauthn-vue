/// <reference types="node" />
import type { PublicKeyCredentialCreationOptionsJSON } from "../types";
export declare type GenerateRegistrationOptionsOpts = {
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
export declare const supportedCOSEAlgorithmIdentifiers: COSEAlgorithmIdentifier[];
export declare function generateRegistrationOptions(options: GenerateRegistrationOptionsOpts): PublicKeyCredentialCreationOptionsJSON;
