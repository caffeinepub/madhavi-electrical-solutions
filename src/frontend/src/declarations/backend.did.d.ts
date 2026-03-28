/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Booking {
  'serviceType' : string,
  'bookingId' : BookingId,
  'description' : string,
  'userEmail' : string,
  'dateTime' : string,
  'status' : string,
  'timestamp' : Time,
}
export type BookingId = string;
export interface BookingSubmission {
  'serviceType' : string,
  'description' : string,
  'userEmail' : string,
  'dateTime' : string,
  'timestamp' : Time,
}
export type Time = bigint;
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } | { 'user' : null } | { 'guest' : null };
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'authenticateUser' : ActorMethod<[string, string], { 'ok' : string } | { 'err' : string }>,
  'registerUser' : ActorMethod<[string, string], { 'ok' : null } | { 'err' : string }>,
  'registerAdmin' : ActorMethod<[string, string], { 'ok' : null } | { 'err' : string }>,
  'getBookings' : ActorMethod<[], Array<Booking>>,
  'getBookingsAuthenticated' : ActorMethod<[string, string], { 'ok' : Array<Booking> } | { 'err' : string }>,
  'getTechnicianBookings' : ActorMethod<[], Array<Booking>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'submitBooking' : ActorMethod<[BookingSubmission], undefined>,
  'updateBookingStatus' : ActorMethod<[string, string], { 'ok' : null } | { 'err' : string }>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
