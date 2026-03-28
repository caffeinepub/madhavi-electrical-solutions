import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type BookingId = Text;

  // V1 type kept for stable variable migration compatibility
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

  // Original stable variable kept with old type for migration compatibility
  let bookings = Map.empty<BookingId, BookingV1>();

  // New stable variable with updated Booking type
  let bookingsV2 = Map.empty<BookingId, Booking>();

  // Migrate any V1 bookings into V2 on upgrade
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

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Email/password auth
  type EmailAuthRecord = {
    email : Text;
    passwordHash : Text;
  };

  let emailAuthStore = Map.empty<Text, EmailAuthRecord>();

  public shared func registerUser(email : Text, passwordHash : Text) : async { #ok; #err : Text } {
    let normalized = email.toLower();
    switch (emailAuthStore.get(normalized)) {
      case (?_) { #err("Email already registered") };
      case (null) {
        emailAuthStore.add(normalized, { email = normalized; passwordHash });
        #ok;
      };
    };
  };

  public query func authenticateUser(email : Text, passwordHash : Text) : async { #ok; #err : Text } {
    let normalized = email.toLower();
    switch (emailAuthStore.get(normalized)) {
      case (null) { #err("Email not found") };
      case (?record) {
        if (record.passwordHash == passwordHash) { #ok }
        else { #err("Incorrect password") };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitBooking(submission : BookingSubmission) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit bookings");
    };
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

  public query ({ caller }) func getBookings() : async [Booking] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookingsV2.values().toArray().sort();
  };

  // Technician: fetch all bookings (open to any caller)
  public query func getTechnicianBookings() : async [Booking] {
    bookingsV2.values().toArray().sort();
  };

  // Technician: update booking status to "accepted" or "completed"
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
