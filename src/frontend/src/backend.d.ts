import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BookingSubmission {
    serviceType: string;
    description: string;
    userEmail: string;
    dateTime: string;
    timestamp: Time;
}
export type BookingId = string;
export type Time = bigint;
export interface Booking {
    serviceType: string;
    bookingId: BookingId;
    description: string;
    userEmail: string;
    dateTime: string;
    status: string;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export type AuthResult = { ok: null } | { err: string };
export type UpdateStatusResult = { ok: null } | { err: string };
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBookings(): Promise<Array<Booking>>;
    getTechnicianBookings(): Promise<Array<Booking>>;
    updateBookingStatus(bookingId: BookingId, newStatus: string): Promise<UpdateStatusResult>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitBooking(submission: BookingSubmission): Promise<void>;
    registerUser(email: string, passwordHash: string): Promise<AuthResult>;
    authenticateUser(email: string, passwordHash: string): Promise<AuthResult>;
}
