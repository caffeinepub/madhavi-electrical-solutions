import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  ThumbsUp,
  Wrench,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetTechnicianBookings,
  useUpdateBookingStatus,
} from "../hooks/useQueries";
import TechnicianLoginPage from "./TechnicianLoginPage";

interface GeoLocation {
  lat: number;
  lng: number;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
        <ThumbsUp className="h-3.5 w-3.5" />
        Accepted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

export default function TechnicianPage() {
  const [isTechLoggedIn, setIsTechLoggedIn] = useState(
    () => !!sessionStorage.getItem("mes_tech_email"),
  );
  const [techEmail, setTechEmail] = useState(
    () => sessionStorage.getItem("mes_tech_email") ?? "",
  );

  const {
    data: bookings = [],
    isLoading,
    refetch,
    isFetching,
  } = useGetTechnicianBookings();
  const { mutateAsync: updateStatus } = useUpdateBookingStatus();
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    action: string;
  } | null>(null);

  // Location state
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationError, setLocationError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  function handleLoginSuccess(email: string) {
    setTechEmail(email);
    setIsTechLoggedIn(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("mes_tech_email");
    sessionStorage.removeItem("mes_tech_password");
    setIsTechLoggedIn(false);
    setTechEmail("");
    setLocation(null);
    setLocationError("");
  }

  async function handleStatusUpdate(bookingId: string, newStatus: string) {
    setPendingAction({ id: bookingId, action: newStatus });
    try {
      await updateStatus({ bookingId, newStatus });
      if (newStatus === "accepted") {
        toast.success("Job accepted!");
      } else if (newStatus === "completed") {
        toast.success("Job marked as completed!");
      }
    } catch {
      toast.error("Failed to update job status. Please try again.");
    } finally {
      setPendingAction(null);
    }
  }

  function handleShareLocation() {
    setLocationError("");
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
        toast.success("Location updated!");
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location permission denied. Please allow location access."
            : "Unable to retrieve your location. Please try again.",
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  if (!isTechLoggedIn) {
    return <TechnicianLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[480px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Zap
                className="h-5 w-5 text-primary-foreground"
                fill="currentColor"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight text-foreground">
                MES Infratech
              </span>
              <span className="text-[10px] tracking-wide text-muted-foreground">
                Technician Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              data-ocid="nav.link"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-border"
              data-ocid="nav.button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 py-8">
        {/* Page heading */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Technician Panel
              </h1>
              <p className="text-xs text-muted-foreground">
                Welcome, {techEmail}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 rounded-lg border-border text-muted-foreground transition-colors hover:text-foreground"
            data-ocid="technician.secondary_button"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="text-xs">Refresh</span>
          </Button>
        </div>

        {/* Location Card */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  My Location
                </p>
                {location ? (
                  <p className="text-xs text-muted-foreground">
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Not shared yet
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {location && (
                <a
                  href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  data-ocid="technician.link"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Maps
                </a>
              )}
              <Button
                size="sm"
                onClick={handleShareLocation}
                disabled={locationLoading}
                className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
                data-ocid="technician.primary_button"
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                {locationLoading ? "Getting..." : location ? "Update" : "Share"}
              </Button>
            </div>
          </div>
          {locationError && (
            <p
              className="mt-3 rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2 text-xs font-medium text-destructive"
              data-ocid="technician.error_state"
            >
              {locationError}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div
            className="flex items-center justify-center py-24"
            data-ocid="technician.loading_state"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-20 text-center"
            data-ocid="technician.empty_state"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              No bookings available
            </p>
            <p className="text-xs text-muted-foreground">
              Check back later for new service requests.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.bookingId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                data-ocid={`technician.item.${index + 1}`}
              >
                <div
                  className={`h-1 w-full ${
                    booking.status === "completed"
                      ? "bg-emerald-500"
                      : booking.status === "accepted"
                        ? "bg-blue-500"
                        : "bg-amber-400"
                  }`}
                />

                <div className="flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-primary/8 px-3 py-1.5">
                      <CircleDot className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-bold text-primary">
                        {booking.serviceType}
                      </span>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Problem
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {booking.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Customer
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {booking.userEmail}
                    </p>
                    {booking.dateTime && (
                      <p className="text-xs text-muted-foreground">
                        {booking.dateTime}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button
                      size="sm"
                      disabled={
                        booking.status === "accepted" ||
                        booking.status === "completed" ||
                        pendingAction?.id === booking.bookingId
                      }
                      onClick={() =>
                        handleStatusUpdate(booking.bookingId, "accepted")
                      }
                      className="h-11 flex-1 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                      data-ocid={`technician.primary_button.${index + 1}`}
                    >
                      {pendingAction?.id === booking.bookingId &&
                      pendingAction.action === "accepted" ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <ThumbsUp className="mr-1.5 h-4 w-4" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      disabled={
                        booking.status === "completed" ||
                        pendingAction?.id === booking.bookingId
                      }
                      onClick={() =>
                        handleStatusUpdate(booking.bookingId, "completed")
                      }
                      className="h-11 flex-1 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                      data-ocid={`technician.secondary_button.${index + 1}`}
                    >
                      {pendingAction?.id === booking.bookingId &&
                      pendingAction.action === "completed" ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      )}
                      Complete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-background py-5">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
