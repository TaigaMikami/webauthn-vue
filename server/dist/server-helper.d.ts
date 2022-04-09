import { LoggedInUser } from "./types/server";
export declare const loggedInUserId = "internalUserId";
export declare const rpID: string;
export declare const inMemoryUserDeviceDB: {
    [loggedInUserId: string]: LoggedInUser;
};
