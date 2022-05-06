import type { AuthenticatorDevice } from "../lib/webauthn/types/index";

interface LoggedInUser {
  id: string;
  username: string;
  devices: AuthenticatorDevice[];
  currentChallenge?: string;
}

interface DBLoggedInUser {
  id: string;
  username: string;
  devices: Object[];
  currentChallenge?: string;
}
