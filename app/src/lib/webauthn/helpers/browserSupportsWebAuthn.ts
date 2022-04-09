export function browserSupportsWebAuthn(): boolean {
  return window?.PublicKeyCredential !== undefined;
}
