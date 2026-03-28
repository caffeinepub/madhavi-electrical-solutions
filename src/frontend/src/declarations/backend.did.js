/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

export const UserRole = IDL.Variant({ 'admin': IDL.Null, 'user': IDL.Null, 'guest': IDL.Null });
export const BookingId = IDL.Text;
export const Time = IDL.Int;
export const Booking = IDL.Record({
  'serviceType': IDL.Text, 'bookingId': BookingId, 'description': IDL.Text,
  'userEmail': IDL.Text, 'dateTime': IDL.Text, 'status': IDL.Text, 'timestamp': Time,
});
export const UserProfile = IDL.Record({ 'name': IDL.Text });
export const BookingSubmission = IDL.Record({
  'serviceType': IDL.Text, 'description': IDL.Text, 'userEmail': IDL.Text,
  'dateTime': IDL.Text, 'timestamp': Time,
});
const AuthResult = IDL.Variant({ 'ok': IDL.Null, 'err': IDL.Text });
const AuthResultWithRole = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });
const BookingsResult = IDL.Variant({ 'ok': IDL.Vec(Booking), 'err': IDL.Text });

const serviceDefinition = {
  '_initializeAccessControlWithSecret': IDL.Func([IDL.Text], [], []),
  'assignCallerUserRole': IDL.Func([IDL.Principal, UserRole], [], []),
  'authenticateUser': IDL.Func([IDL.Text, IDL.Text], [AuthResultWithRole], ['query']),
  'registerUser': IDL.Func([IDL.Text, IDL.Text], [AuthResult], []),
  'registerAdmin': IDL.Func([IDL.Text, IDL.Text], [AuthResult], []),
  'getBookings': IDL.Func([], [IDL.Vec(Booking)], ['query']),
  'getBookingsAuthenticated': IDL.Func([IDL.Text, IDL.Text], [BookingsResult], ['query']),
  'getCallerUserProfile': IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getCallerUserRole': IDL.Func([], [UserRole], ['query']),
  'getTechnicianBookings': IDL.Func([], [IDL.Vec(Booking)], ['query']),
  'getUserProfile': IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
  'isCallerAdmin': IDL.Func([], [IDL.Bool], ['query']),
  'saveCallerUserProfile': IDL.Func([UserProfile], [], []),
  'submitBooking': IDL.Func([BookingSubmission], [], []),
  'updateBookingStatus': IDL.Func([IDL.Text, IDL.Text], [AuthResult], []),
};

export const idlService = IDL.Service(serviceDefinition);
export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({ 'admin': IDL.Null, 'user': IDL.Null, 'guest': IDL.Null });
  const BookingId = IDL.Text;
  const Time = IDL.Int;
  const Booking = IDL.Record({
    'serviceType': IDL.Text, 'bookingId': BookingId, 'description': IDL.Text,
    'userEmail': IDL.Text, 'dateTime': IDL.Text, 'status': IDL.Text, 'timestamp': Time,
  });
  const UserProfile = IDL.Record({ 'name': IDL.Text });
  const BookingSubmission = IDL.Record({
    'serviceType': IDL.Text, 'description': IDL.Text, 'userEmail': IDL.Text,
    'dateTime': IDL.Text, 'timestamp': Time,
  });
  const AuthResult = IDL.Variant({ 'ok': IDL.Null, 'err': IDL.Text });
  const AuthResultWithRole = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });
  const BookingsResult = IDL.Variant({ 'ok': IDL.Vec(Booking), 'err': IDL.Text });
  return IDL.Service({
    '_initializeAccessControlWithSecret': IDL.Func([IDL.Text], [], []),
    'assignCallerUserRole': IDL.Func([IDL.Principal, UserRole], [], []),
    'authenticateUser': IDL.Func([IDL.Text, IDL.Text], [AuthResultWithRole], ['query']),
    'registerUser': IDL.Func([IDL.Text, IDL.Text], [AuthResult], []),
    'registerAdmin': IDL.Func([IDL.Text, IDL.Text], [AuthResult], []),
    'getBookings': IDL.Func([], [IDL.Vec(Booking)], ['query']),
    'getBookingsAuthenticated': IDL.Func([IDL.Text, IDL.Text], [BookingsResult], ['query']),
    'getCallerUserProfile': IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole': IDL.Func([], [UserRole], ['query']),
    'getTechnicianBookings': IDL.Func([], [IDL.Vec(Booking)], ['query']),
    'getUserProfile': IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'isCallerAdmin': IDL.Func([], [IDL.Bool], ['query']),
    'saveCallerUserProfile': IDL.Func([UserProfile], [], []),
    'submitBooking': IDL.Func([BookingSubmission], [], []),
    'updateBookingStatus': IDL.Func([IDL.Text, IDL.Text], [AuthResult], []),
  });
};

export const init = ({ IDL }) => { return []; };
