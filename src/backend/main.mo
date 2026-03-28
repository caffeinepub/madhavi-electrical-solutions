import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type BookingId = Text;

  type BookingV1 = {
    bookingId : BookingId;
    serviceType : Text;
    description : Text;
    timestamp : Time.Time;
  };

  type BookingV2 = {
    bookingId : BookingId;
    serviceType : Text;
    description : Text;
    userEmail : Text;
    dateTime : Text;
    status : Text;
    timestamp : Time.Time;
  };

  type Booking = {
    bookingId : BookingId;
    serviceType : Text;
    description : Text;
    userEmail : Text;
    dateTime : Text;
    status : Text;
    assignedTechnician : Text;
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

  // Legacy maps kept for upgrade compatibility
  let bookings = Map.empty<BookingId, BookingV1>();
  let bookingsV2 = Map.empty<BookingId, BookingV2>();
  let bookingsV3 = Map.empty<BookingId, Booking>();

  // Technician store
  type Technician = {
    id : Text;
    name : Text;
    email : Text;
  };
  var technicianIdCounter = 0;
  let technicianStore = Map.empty<Text, Technician>();

  system func postupgrade() {
    // Migrate V1 -> V3
    for (b in bookings.values()) {
      switch (bookingsV3.get(b.bookingId)) {
        case (?_) {};
        case (null) {
          bookingsV3.add(b.bookingId, {
            bookingId = b.bookingId;
            serviceType = b.serviceType;
            description = b.description;
            userEmail = "";
            dateTime = "";
            status = "pending";
            assignedTechnician = "";
            timestamp = b.timestamp;
          });
        };
      };
    };
    // Migrate V2 -> V3
    for (b in bookingsV2.values()) {
      switch (bookingsV3.get(b.bookingId)) {
        case (?_) {};
        case (null) {
          bookingsV3.add(b.bookingId, {
            bookingId = b.bookingId;
            serviceType = b.serviceType;
            description = b.description;
            userEmail = b.userEmail;
            dateTime = b.dateTime;
            status = b.status;
            assignedTechnician = "";
            timestamp = b.timestamp;
          });
        };
      };
    };
    // Migrate emailAuthStore (no role) -> emailAuthStoreV2
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
    // Seed default technicians if store is empty
    if (technicianStore.size() == 0) {
      let defaults = [
        ("Ramesh Kumar", "ramesh@mes.in"),
        ("Suresh Verma", "suresh@mes.in"),
        ("Prakash Singh", "prakash@mes.in"),
        ("Vijay Yadav", "vijay@mes.in"),
      ];
      for ((name, email) in defaults.vals()) {
        technicianIdCounter += 1;
        let id = technicianIdCounter.toText();
        technicianStore.add(id, { id; name; email });
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

  type EmailAuthRecord = {
    email : Text;
    passwordHash : Text;
  };
  let emailAuthStore = Map.empty<Text, EmailAuthRecord>();

  type EmailAuthRecordV2 = {
    email : Text;
    passwordHash : Text;
    role : Text;
  };
  let emailAuthStoreV2 = Map.empty<Text, EmailAuthRecordV2>();

  public shared func registerUser(email : Text, passwordHash : Text) : async { #ok; #err : Text } {
    let normalized = email.toLower();
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
    switch (emailAuthStoreV2.get(normalized)) {
      case (?record) {
        if (record.passwordHash == passwordHash) { #ok(record.role) }
        else { #err("Incorrect password. Please try again.") };
      };
      case (null) {
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
    bookingsV3.add(bookingId, {
      bookingId;
      serviceType = submission.serviceType;
      description = submission.description;
      userEmail = submission.userEmail;
      dateTime = submission.dateTime;
      status = "pending";
      assignedTechnician = "";
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
        #ok(bookingsV3.values().toArray().sort());
      };
    };
  };

  public query func getTechnicianBookings() : async [Booking] {
    bookingsV3.values().toArray().sort();
  };

  public shared func updateBookingStatus(bookingId : BookingId, newStatus : Text) : async { #ok; #err : Text } {
    switch (bookingsV3.get(bookingId)) {
      case (null) { #err("Booking not found") };
      case (?b) {
        if (newStatus != "accepted" and newStatus != "completed" and newStatus != "in-progress" and newStatus != "pending") {
          return #err("Invalid status");
        };
        bookingsV3.add(bookingId, {
          bookingId = b.bookingId;
          serviceType = b.serviceType;
          description = b.description;
          userEmail = b.userEmail;
          dateTime = b.dateTime;
          status = newStatus;
          assignedTechnician = b.assignedTechnician;
          timestamp = b.timestamp;
        });
        #ok;
      };
    };
  };

  // ── Technician management ──────────────────────────────────────────────────

  public query func getTechnicians() : async [Technician] {
    technicianStore.values().toArray();
  };

  public shared func addTechnician(name : Text, email : Text) : async { #ok : Text; #err : Text } {
    technicianIdCounter += 1;
    let id = technicianIdCounter.toText();
    technicianStore.add(id, { id; name; email });
    #ok(id);
  };

  public shared func assignTechnicianToBooking(bookingId : BookingId, technicianName : Text) : async { #ok; #err : Text } {
    switch (bookingsV3.get(bookingId)) {
      case (null) { #err("Booking not found") };
      case (?b) {
        bookingsV3.add(bookingId, {
          bookingId = b.bookingId;
          serviceType = b.serviceType;
          description = b.description;
          userEmail = b.userEmail;
          dateTime = b.dateTime;
          status = b.status;
          assignedTechnician = technicianName;
          timestamp = b.timestamp;
        });
        #ok;
      };
    };
  };
};
