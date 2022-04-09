"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inMemoryUserDeviceDB = exports.rpID = exports.loggedInUserId = void 0;
const { ENABLE_CONFORMANCE, ENABLE_HTTPS, RP_ID = 'localhost', } = process.env;
exports.loggedInUserId = 'internalUserId';
exports.rpID = RP_ID;
exports.inMemoryUserDeviceDB = {
    [exports.loggedInUserId]: {
        id: exports.loggedInUserId,
        username: `user@${exports.rpID}`,
        devices: [],
        /**
         * A simple way of storing a user's current challenge being signed by registration or authentication.
         * It should be expired after `timeout` milliseconds (optional argument for `generate` methods,
         * defaults to 60000ms)
         */
        currentChallenge: undefined,
    },
};
//# sourceMappingURL=server-helper.js.map