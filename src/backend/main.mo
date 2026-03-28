import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Keep accessControlState to maintain upgrade compatibility
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type BookingId = Text;

  type BookingV1 = {
    bookingId : BookingId;
    serviceType : Text;
    description : Text;
    timestamp : Time.Time;
  };

  type Booking = {
    bookingId : BookingId;
    serviceType : Text;
    description : Text;
    userEmail : Text;
    dateTime : Text;
    status : Text;
    timestamp : Time.Time;
  };

  module Booking {
    public func compare(b1 : Booking, b2 : Booking) : Order.Order {
      Int.compare(b1.timestamp, b2.timestamp);
    };
  };

  var bookingIdCounter = 0;
  func createBookingId() : BookingId {
    bookingIdCounter += 1;
    bookingIdCounter.toText();
  };

  let bookings = Map.empty<BookingId, BookingV1>();
  let bookingsV2 = Map.empty<BookingId, Booking>();

  system func postupgrade() {
    for (b in bookings.values()) {
      switch (bookingsV2.get(b.bookingId)) {
        case (?_) {};
        case (null) {
          bookingsV2.add(b.bookingId, {
            bookingId = b.bookingId;
            serviceType = b.serviceType;
            description = b.description;
            userEmail = "";
            dateTime = "";
            status = "pending";
            timestamp = b.timestamp;
          });
        };
      };
    };
    // Migrate emailAuthStore (old, no role) -> emailAuthStoreV2 (with role)
    for (record in emailAuthStore.values()) {
      switch (emailAuthStoreV2.get(record.email)) {
        case (?_) {};
        case (null) {
          emailAuthStoreV2.add(record.email, {
            email = record.email;
            passwordHash = record.passwordHash;
            role = "customer";
          });
        };
      };
    };
  };

  public type BookingSubmission = {
    serviceType : Text;
    description : Text;
    userEmail : Text;
    dateTime : Text;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  // Keep userProfiles for upgrade compatibility
  let userProfiles = Map.empty<Principal, UserProfile>();

  // OLD email auth store (no role) — kept for upgrade compatibility + migration source
  type EmailAuthRecord = {
    email : Text;
    passwordHash : Text;
  };
  let emailAuthStore = Map.empty<Text, EmailAuthRecord>();

  // NEW email auth store with role
  type EmailAuthRecordV2 = {
    email : Text;
    passwordHash : Text;
    role : Text; // "customer", "technician", "admin"
  };
  let emailAuthStoreV2 = Map.empty<Text, EmailAuthRecordV2>();

  public shared func registerUser(email : Text, passwordHash : Text) : async { #ok; #err : Text } {
    let normalized = email.toLower();
    // Check both stores
    let existsOld = switch (emailAuthStore.get(normalized)) { case (?_) true; case (null) false };
    let existsNew = switch (emailAuthStoreV2.get(normalized)) { case (?_) true; case (null) false };
    if (existsOld or existsNew) {
      #err("Email already registered");
    } else {
      emailAuthStoreV2.add(normalized, { email = normalized; passwordHash; role = "customer" });
      #ok;
    };
  };

  public query func authenticateUser(email : Text, passwordHash : Text) : async { #ok : Text; #err : Text } {
    let normalized = email.toLower();
    // Check new store first
    switch (emailAuthStoreV2.get(normalized)) {
      case (?record) {
        if (record.passwordHash == passwordHash) { #ok(record.role) }
        else { #err("Incorrect password. Please try again.") };
      };
      case (null) {
        // Fallback to old store
        switch (emailAuthStore.get(normalized)) {
          case (null) { #err("Email not found. Please sign up first.") };
          case (?record) {
            if (record.passwordHash == passwordHash) { #ok("customer") }
            else { #err("Incorrect password. Please try again.") };
          };
        };
      };
    };
  };

  // Register first admin (only works if no admin exists yet)
  public shared func registerAdmin(email : Text, passwordHash : Text) : async { #ok; #err : Text } {
    let normalized = email.toLower();
    for (record in emailAuthStoreV2.values()) {
      if (record.role == "admin") {
        return #err("Admin already exists");
      };
    };
    switch (emailAuthStoreV2.get(normalized)) {
      case (?existing) {
        if (existing.passwordHash != passwordHash) { return #err("Invalid credentials") };
        emailAuthStoreV2.add(normalized, { email = existing.email; passwordHash = existing.passwordHash; role = "admin" });
        #ok;
      };
      case (null) {
        // Also check old store
        switch (emailAuthStore.get(normalized)) {
          case (?old) {
            if (old.passwordHash != passwordHash) { return #err("Invalid credentials") };
            emailAuthStoreV2.add(normalized, { email = old.email; passwordHash = old.passwordHash; role = "admin" });
            #ok;
          };
          case (null) {
            emailAuthStoreV2.add(normalized, { email = normalized; passwordHash; role = "admin" });
            #ok;
          };
        };
      };
    };
  };

  public shared func submitBooking(submission : BookingSubmission) : async () {
    let bookingId = createBookingId();
    bookingsV2.add(bookingId, {
      bookingId;
      serviceType = submission.serviceType;
      description = submission.description;
      userEmail = submission.userEmail;
      dateTime = submission.dateTime;
      status = "pending";
      timestamp = submission.timestamp;
    });
  };

  public query func getBookingsAuthenticated(email : Text, passwordHash : Text) : async { #ok : [Booking]; #err : Text } {
    let normalized = email.toLower();
    switch (emailAuthStoreV2.get(normalized)) {
      case (null) { #err("Not authenticated") };
      case (?record) {
        if (record.passwordHash != passwordHash) { return #err("Invalid credentials") };
        if (record.role != "admin") { return #err("Access denied: not an admin") };
        #ok(bookingsV2.values().toArray().sort());
      };
    };
  };

  public query func getTechnicianBookings() : async [Booking] {
    bookingsV2.values().toArray().sort();
  };

  public shared func updateBookingStatus(bookingId : BookingId, newStatus : Text) : async { #ok; #err : Text } {
    switch (bookingsV2.get(bookingId)) {
      case (null) { #err("Booking not found") };
      case (?b) {
        if (newStatus != "accepted" and newStatus != "completed") {
          return #err("Invalid status");
        };
        bookingsV2.add(bookingId, {
          bookingId = b.bookingId;
          serviceType = b.serviceType;
          description = b.description;
          userEmail = b.userEmail;
          dateTime = b.dateTime;
          status = newStatus;
          timestamp = b.timestamp;
        });
        #ok;
      };
    };
  };
};
