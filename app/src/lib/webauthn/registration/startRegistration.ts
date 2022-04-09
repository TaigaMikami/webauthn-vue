import base64URLStringToBuffer from "@/lib/webauthn/helpers/base64URLStringToBuffer";
import { browserSupportsWebAuthn } from "@/lib/webauthn/helpers/browserSupportsWebAuthn";
import toPublicKeyCredentialDescriptor from "@/lib/webauthn/helpers/toPublicKeyCredentialDescriptor";
import utf8StringToBuffer from "@/lib/webauthn/helpers/utf8StringToBuffer";
import { identifyRegistrationError } from "@/lib/webauthn/helpers/identifyRegistrationError";
import bufferToBase64URLString from "@/lib/webauthn/helpers/buffertToBase64URLString";
import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationCredential,
  RegistrationCredentialJSON
} from "@/lib/webauthn/types";

export default async function startRegistration(
  creationOptionsJSON: PublicKeyCredentialCreationOptionsJSON
): Promise<RegistrationCredentialJSON> {
  if (!browserSupportsWebAuthn()) {
    throw new Error("WebAuthn is not supported in this browser");
  }

  const publicKey: PublicKeyCredentialCreationOptions = {
    ...creationOptionsJSON,
    challenge: base64URLStringToBuffer(creationOptionsJSON.challenge),
    user: {
      ...creationOptionsJSON.user,
      id: utf8StringToBuffer(creationOptionsJSON.user.id)
    },
    excludeCredentials: creationOptionsJSON.excludeCredentials.map(
      toPublicKeyCredentialDescriptor
    )
  };

  const options: CredentialCreationOptions = { publicKey };

  // Wait for the user to complete attestation
  let credential;
  try {
    credential = (await navigator.credentials.create(
      options
    )) as RegistrationCredential;
  } catch (err) {
    throw identifyRegistrationError({ error: err as Error, options });
  }

  if (!credential) {
    throw new Error("Registration was not completed");
  }

  const { id, rawId, response, type } = credential;

  // Convert values to base64 to make it easier to send back to the server
  const credentialJSON: RegistrationCredentialJSON = {
    id,
    rawId: bufferToBase64URLString(rawId),
    response: {
      attestationObject: bufferToBase64URLString(response.attestationObject),
      clientDataJSON: bufferToBase64URLString(response.clientDataJSON)
    },
    type,
    clientExtensionResults: credential.getClientExtensionResults()
  };

  /**
   * Include the authenticator's transports if the browser supports querying for them
   */
  if (typeof response.getTransports === "function") {
    credentialJSON.transports = response.getTransports();
  }

  return credentialJSON;
}
