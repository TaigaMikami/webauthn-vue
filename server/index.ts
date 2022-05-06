import express from "express";
import { inMemoryUserDeviceDB, loggedInUserId, rpID, expectedOrigin } from "./server-helper";
import type {
  GenerateRegistrationOptionsOpts
} from "./lib/webauthn/registration/generateRegistrationOptions";
import { 
  // Registration
  generateRegistrationOptions
} from "./lib/webauthn/registration/generateRegistrationOptions";
import type {
  RegistrationCredentialJSON,
  AuthenticatorDevice,
  AuthenticationCredentialJSON
} from "./lib/webauthn/types";

import type { VerifiedRegistrationResponse, VerifyRegistrationResponseOpts } from "./lib/webauthn/registration/verifyRegistrationResponse";
import verifyRegistrationResponse from "./lib/webauthn/registration/verifyRegistrationResponse";
import generateAuthenticationOptions, { GenerateAuthenticationOptionsOpts } from "./lib/webauthn/authentication/generateAuthenticationOptions";
import base64url from "base64url";
import verifyAuthenticationResponse, { VerifiedAuthenticationResponse, VerifyAuthenticationResponseOpts } from "./lib/webauthn/authentication/verifyAuthenticationResponse";

const app = express();
const port = "8081"

app.use(express.json());

// CORSを許可する
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get("/generate-registration-options", (req, res) => {
  const user = inMemoryUserDeviceDB[loggedInUserId];

  const {
    /**
     * The username can be a human-readable name, email, etc... as it is intended only for display.
     */
    username,
    devices,
  } = user;

  const opts: GenerateRegistrationOptionsOpts = {
    rpName: 'SimpleWebAuthn Example',
    rpID,
    userID: loggedInUserId,
    userName: username,
    timeout: 60000,
    attestationType: 'none',
    /**
     * Passing in a user's list of already-registered authenticator IDs here prevents users from
     * registering the same device multiple times. The authenticator will simply throw an error in
     * the browser if it's asked to perform registration when one of these ID's already resides
     * on it.
     */
    excludeCredentials: devices.map(dev => ({
      id: dev.credentialID,
      type: 'public-key',
      transports: dev.transports,
    })),
    /**
     * The optional authenticatorSelection property allows for specifying more constraints around
     * the types of authenticators that users to can use for registration
     */
    authenticatorSelection: {
      userVerification: 'required',
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  };

  const options = generateRegistrationOptions(opts);

  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify an authenticator response.
   */
   inMemoryUserDeviceDB[loggedInUserId].currentChallenge = options.challenge;

   res.send(options);
});

app.post('/verify-registration', async (req, res) => {
  const body: RegistrationCredentialJSON = req.body;

  const user = inMemoryUserDeviceDB[loggedInUserId];

  const expectedChallenge = user.currentChallenge;

  let verification: VerifiedRegistrationResponse;
  try {
    const opts: VerifyRegistrationResponseOpts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: true,
    };
    console.log(opts);
    verification = await verifyRegistrationResponse(opts);
  } catch (error) {
    const _error = error as Error;
    console.error(_error);
    return res.status(400).send({ error: _error.message });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    const existingDevice = user.devices.find(device => device.credentialID === credentialID);

    if (!existingDevice) {
      /**
       * Add the returned device to the user's list of devices
       */
      const newDevice: AuthenticatorDevice = {
        credentialPublicKey,
        credentialID,
        counter,
        transports: body.transports,
      };
      user.devices.push(newDevice);
    }
  }

  res.send({ verified });
});

app.get("/in-memory", (req, res) => {
  console.log(inMemoryUserDeviceDB);
  res.send({ status: "success", user: JSON.stringify(inMemoryUserDeviceDB) });
})

/**
 * Login (a.k.a. "Authentication")
 */
 app.get('/generate-authentication-options', (req, res) => {
  // You need to know the user by this point
  const user = inMemoryUserDeviceDB[loggedInUserId];

  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: user.devices.map(dev => ({
      id: dev.credentialID,
      type: 'public-key',
      transports: dev.transports ?? ['usb', 'ble', 'nfc', 'internal'],
    })),
    userVerification: 'required',
    rpID,
  };

  const options = generateAuthenticationOptions(opts);

  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify an authenticator response.
   */
  inMemoryUserDeviceDB[loggedInUserId].currentChallenge = options.challenge;

  res.send(options);
});

app.post('/verify-authentication', (req, res) => {
  const body: AuthenticationCredentialJSON = req.body;

  const user = inMemoryUserDeviceDB[loggedInUserId];

  const expectedChallenge = user.currentChallenge;

  let dbAuthenticator;
  const bodyCredIDBuffer = base64url.toBuffer(body.rawId);
  // "Query the DB" here for an authenticator matching `credentialID`
  for (const dev of user.devices) {
    if (dev.credentialID.equals(bodyCredIDBuffer)) {
      dbAuthenticator = dev;
      break;
    }
  }

  if (!dbAuthenticator) {
    throw new Error(`could not find authenticator matching ${body.id}`);
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    const opts: VerifyAuthenticationResponseOpts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: dbAuthenticator,
      requireUserVerification: true,
    };
    verification = verifyAuthenticationResponse(opts);
  } catch (error) {
    const _error = error as Error;
    console.error(_error);
    return res.status(400).send({ error: _error.message });
  }

  const { verified, authenticationInfo } = verification;

  if (verified) {
    // Update the authenticator's counter in the DB to the newest count in the authentication
    dbAuthenticator.counter = authenticationInfo.newCounter;
  }

  res.send({ verified });
});

app.listen(port, () => {
  console.log(`🚀 Server ready at ${port}`)
})
