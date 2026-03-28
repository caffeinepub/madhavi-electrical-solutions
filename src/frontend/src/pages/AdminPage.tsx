import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  ChevronLeft,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Booking } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetBookings, useIsAdmin } from "../hooks/useQueries";

const SERVICE_COLORS: Record<string, string> = {
  "Electric Repair": "bg-red-500/10 text-red-400 border-red-500/20",
  Wiring: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Panel Work": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Maintenance: "bg-green-500/10 text-green-400 border-green-500/20",
};

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export default function AdminPage() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    refetch,
    isFetching,
  } = useGetBookings();
  const [sortNewest, setSortNewest] = useState(true);

  const sortedBookings: Booking[] = [...bookings].sort((a, b) =>
    sortNewest
      ? Number(b.timestamp - a.timestamp)
      : Number(a.timestamp - b.timestamp),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-electric text-primary-foreground">
              <Zap className="h-5 w-5" fill="currentColor" />
            </div>
            <span className="hidden font-display text-sm font-bold uppercase tracking-widest text-foreground sm:block">
              Madhavi Electrical
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-electric"
              data-ocid="nav.link"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:block">Back to Home</span>
            </Link>

            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                data-ocid="admin.secondary_button"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                className="bg-electric text-primary-foreground hover:bg-electric-dim"
                data-ocid="admin.primary_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{" "}
                    Connecting…
                  </>
                ) : (
                  <>
                    <LogIn className="mr-1.5 h-3.5 w-3.5" /> Connect
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-electric" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-foreground sm:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and view all incoming service bookings.
            </p>
          </div>

          {/* Not logged in */}
          {!isLoggedIn && (
            <div
              className="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-12 text-center"
              data-ocid="admin.panel"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-electric/10">
                <LogIn className="h-7 w-7 text-electric" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Admin Access Required
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please connect to access the booking management panel.
                </p>
              </div>
              <Button
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                className="bg-electric px-8 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-electric-dim"
                data-ocid="admin.open_modal_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Connecting…
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Connect to Admin
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Logged in but checking admin */}
          {isLoggedIn && adminLoading && (
            <div
              className="flex items-center justify-center py-20"
              data-ocid="admin.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-electric" />
            </div>
          )}

          {/* Not admin */}
          {isLoggedIn && !adminLoading && !isAdmin && (
            <div
              className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center"
              data-ocid="admin.error_state"
            >
              <ShieldAlert className="h-10 w-10 text-destructive" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Access Denied
              </h2>
              <p className="text-sm text-muted-foreground">
                Your account does not have admin privileges to view this panel.
              </p>
            </div>
          )}

          {/* Admin dashboard */}
          {isLoggedIn && !adminLoading && isAdmin && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                    Service Bookings
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {bookings.length}{" "}
                    {bookings.length === 1 ? "booking" : "bookings"} total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortNewest(!sortNewest)}
                    className="border-border text-muted-foreground hover:border-electric hover:text-electric"
                    data-ocid="admin.toggle"
                  >
                    <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                    {sortNewest ? "Newest First" : "Oldest First"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="border-border text-muted-foreground hover:border-electric hover:text-electric"
                    data-ocid="admin.secondary_button"
                  >
                    <RefreshCw
                      className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>

              {bookingsLoading ? (
                <div
                  className="flex items-center justify-center py-16"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-electric" />
                </div>
              ) : sortedBookings.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-3 py-16 text-center"
                  data-ocid="admin.empty_state"
                >
                  <Zap className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No bookings yet. They'll appear here once customers submit
                    requests.
                  </p>
                </div>
              ) : (
                <div
                  className="overflow-x-auto rounded-lg border border-border"
                  data-ocid="admin.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          #
                        </TableHead>
                        <TableHead className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Service Type
                        </TableHead>
                        <TableHead className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Problem Description
                        </TableHead>
                        <TableHead className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Date &amp; Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedBookings.map((booking, idx) => (
                        <TableRow
                          key={booking.bookingId}
                          className="border-border transition-colors hover:bg-muted/30"
                          data-ocid={`admin.row.${idx + 1}`}
                        >
                          <TableCell className="w-10 text-sm font-medium text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${
                                SERVICE_COLORS[booking.serviceType] ??
                                "bg-muted/50 text-foreground border-border"
                              }`}
                            >
                              {booking.serviceType}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="line-clamp-2 text-sm text-foreground">
                              {booking.description}
                            </p>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatTimestamp(booking.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
