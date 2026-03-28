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
export type AuthResult = { ok: null } | { err: string };
export type AuthRoleResult = { ok: string } | { err: string };
export type UpdateStatusResult = { ok: null } | { err: string };
export interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    submitBooking(submission: BookingSubmission): Promise<void>;
    registerUser(email: string, passwordHash: string): Promise<AuthResult>;
    authenticateUser(email: string, passwordHash: string): Promise<AuthRoleResult>;
    registerAdmin(email: string, passwordHash: string): Promise<AuthResult>;
    getTechnicianBookings(): Promise<Array<Booking>>;
    updateBookingStatus(bookingId: BookingId, newStatus: string): Promise<UpdateStatusResult>;
    getBookingsAuthenticated(email: string, passwordHash: string): Promise<{ ok: Booking[] } | { err: string }>;
}
