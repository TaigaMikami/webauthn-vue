import { PublicKeyCredentialDescriptorJSON } from "@/lib/webauthn/types";
import base64URLStringToBuffer from "./base64URLStringToBuffer";

export default function toPublicKeyCredentialDescriptor(
  descriptor: PublicKeyCredentialDescriptorJSON
): PublicKeyCredentialDescriptor {
  const { id } = descriptor;

  return {
    ...descriptor,
    id: base64URLStringToBuffer(id)
  };
}
