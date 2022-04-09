"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_helper_1 = require("./server-helper");
const generateRegistrationOptions_1 = require("./lib/webauthn/registration/generateRegistrationOptions");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/generate-registration-options", (req, res) => {
    const user = server_helper_1.inMemoryUserDeviceDB[server_helper_1.loggedInUserId];
    const { 
    /**
     * The username can be a human-readable name, email, etc... as it is intended only for display.
     */
    username, devices, } = user;
    const opts = {
        rpName: 'SimpleWebAuthn Example',
        rpID: server_helper_1.rpID,
        userID: server_helper_1.loggedInUserId,
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
    const options = (0, generateRegistrationOptions_1.generateRegistrationOptions)(opts);
    /**
     * The server needs to temporarily remember this value for verification, so don't lose it until
     * after you verify an authenticator response.
     */
    server_helper_1.inMemoryUserDeviceDB[server_helper_1.loggedInUserId].currentChallenge = options.challenge;
    res.send(options);
});
//# sourceMappingURL=index.js.map