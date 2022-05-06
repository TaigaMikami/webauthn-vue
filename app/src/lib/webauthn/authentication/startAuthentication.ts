import {
  AuthenticationCredential,
  AuthenticationCredentialJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "../types";
import { browserSupportsWebAuthn } from "@/lib/webauthn/helpers/browserSupportsWebAuthn";
import toPublicKeyCredentialDescriptor from "../helpers/toPublicKeyCredentialDescriptor";
import base64URLStringToBuffer from "../helpers/base64URLStringToBuffer";
import { identifyAuthenticationError } from "../helpers/identifyAuthenticationError";
import bufferToUTF8String from "../helpers/bufferToUTF8String";
import bufferToBase64URLString from "../helpers/buffertToBase64URLString";

/**
 * Begin authenticator "login" via WebAuthn assertion
 *
 * @param requestOptionsJSON Output from @simplewebauthn/server's generateAssertionOptions(...)
 */
export default async function startAuthentication(
  requestOptionsJSON: PublicKeyCredentialRequestOptionsJSON
): Promise<AuthenticationCredentialJSON> {
  if (!browserSupportsWebAuthn()) {
    throw new Error("WebAuthn is not supported in this browser");
  }

  // We need to avoid passing empty array to avoid blocking retrieval
  // of public key
  let allowCredentials;
  if (requestOptionsJSON.allowCredentials?.length !== 0) {
    allowCredentials = requestOptionsJSON.allowCredentials?.map(
      toPublicKeyCredentialDescriptor
    );
  }

  // We need to convert some values to Uint8Arrays before passing the credentials to the navigator
  const publicKey: PublicKeyCredentialRequestOptions = {
    ...requestOptionsJSON,
    challenge: base64URLStringToBuffer(requestOptionsJSON.challenge),
    allowCredentials
  };

  const options: CredentialRequestOptions = { publicKey };

  // Wait for the user to complete assertion
  let credential;
  try {
    credential = (await navigator.credentials.get(
      options
    )) as AuthenticationCredential;
  } catch (err) {
    console.log(err);
    throw identifyAuthenticationError({ error: err as Error, options });
  }

  if (!credential) {
    throw new Error("Authentication was not completed");
  }

  const { id, rawId, response, type } = credential;

  let userHandle = undefined;
  if (response.userHandle) {
    userHandle = bufferToUTF8String(response.userHandle);
  }

  // Convert values to base64 to make it easier to send back to the server
  return {
    id,
    rawId: bufferToBase64URLString(rawId),
    response: {
      authenticatorData: bufferToBase64URLString(response.authenticatorData),
      clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
      signature: bufferToBase64URLString(response.signature),
      userHandle
    },
    type,
    clientExtensionResults: credential.getClientExtensionResults()
  };
}
