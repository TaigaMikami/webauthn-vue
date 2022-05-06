import { DBLoggedInUser, LoggedInUser } from "./types/server";
 

const {
  ENABLE_CONFORMANCE,
  ENABLE_HTTPS,
  RP_ID = 'cc1b-2400-2411-1ac1-c400-4922-83ad-ec80-f762.ngrok.io',
} = process.env;

export const loggedInUserId = 'internalUserId';

export const rpID = RP_ID;

export let expectedOrigin = 'https://cc1b-2400-2411-1ac1-c400-4922-83ad-ec80-f762.ngrok.io';

export const inMemoryUserDeviceDB: { [loggedInUserId: string]: LoggedInUser } = {
  [loggedInUserId]: {
    id: loggedInUserId,
    username: `user@${rpID}`,
    devices: [],
    /**
     * A simple way of storing a user's current challenge being signed by registration or authentication.
     * It should be expired after `timeout` milliseconds (optional argument for `generate` methods,
     * defaults to 60000ms)
     */
    currentChallenge: undefined,
  },
};

export function userDeviceDBObject(userId: string): LoggedInUser {
  return {
    id: userId,
    username: `${userId}@${rpID}`,
    devices: [],
    /**
     * A simple way of storing a user's current challenge being signed by registration or authentication.
     * It should be expired after `timeout` milliseconds (optional argument for `generate` methods,
     * defaults to 60000ms)
     */
    currentChallenge: undefined,
  };
}

export function transferUserFromDBToUser(userFromDB: DBLoggedInUser): LoggedInUser {
  const devices = userFromDB.devices.map(device => {
    console.log(device);
    return {
      credentialPublicKey: Buffer.from((device as any).credentialPublicKey, "base64"),
      credentialID: Buffer.from((device as  any).credentialID, "base64"),
      counter: (device as any).counter,
      transports: (device as any).transports,
    }
  });

  const user = {
    id: userFromDB.id,
    username: userFromDB.username,
    devices,
    currentChallenge: userFromDB.currentChallenge
  }

  return user;
}

export function transferUserToUserForDB(user: LoggedInUser): DBLoggedInUser {
  const devices = user.devices.map(device => {
    return {
      credentialPublicKey: device.credentialPublicKey.toString("base64"),
      credentialID: device.credentialID.toString("base64"),
      counter: device.counter,
      transports: device.transports,
    }
  });

  const userForDB = {
    id: user.id,
    username: user.username,
    devices,
    currentChallenge: user.currentChallenge
  }

  return userForDB;
}

