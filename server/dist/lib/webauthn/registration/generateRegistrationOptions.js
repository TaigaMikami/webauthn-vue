"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRegistrationOptions = exports.supportedCOSEAlgorithmIdentifiers = void 0;
const base64url_1 = __importDefault(require("base64url"));
const generateChallenge_1 = __importDefault(require("../helpers/generateChallenge"));
exports.supportedCOSEAlgorithmIdentifiers = [
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
const defaultAuthenticatorSelection = {
    requireResidentKey: false,
    userVerification: 'preferred',
};
const defaultSupportedAlgorithmIDs = exports.supportedCOSEAlgorithmIdentifiers.filter(id => id !== -65535);
function generateRegistrationOptions(options) {
    const { rpName, rpID, userID, userName, challenge = (0, generateChallenge_1.default)(), userDisplayName = userName, timeout = 60000, attestationType = 'none', excludeCredentials = [], authenticatorSelection = defaultAuthenticatorSelection, extensions, supportedAlgorithmIDs = defaultSupportedAlgorithmIDs, } = options;
    /**
     * Prepare pubKeyCredParams from the array of algorithm ID's
     */
    const pubKeyCredParams = supportedAlgorithmIDs.map(id => ({
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
    }
    else {
        authenticatorSelection.requireResidentKey = false;
    }
    return {
        challenge: base64url_1.default.encode(challenge),
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
            id: base64url_1.default.encode(cred.id),
        })),
        authenticatorSelection,
        extensions,
    };
}
exports.generateRegistrationOptions = generateRegistrationOptions;
//# sourceMappingURL=generateRegistrationOptions.js.map