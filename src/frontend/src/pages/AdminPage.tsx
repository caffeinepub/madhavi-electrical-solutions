import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CheckCircle,
  ChevronLeft,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Booking } from "../backend";
import { useActor } from "../hooks/useActor";
import { useAuth } from "../hooks/useAuth";
import {
  useGetAdminBookings,
  useUpdateBookingStatus,
} from "../hooks/useQueries";
import { hashPassword } from "../utils/hashPassword";

const SERVICE_COLORS: Record<string, string> = {
  "Electric Repair": "bg-red-500/10 text-red-400 border-red-500/20",
  Wiring: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Panel Work": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Maintenance: "bg-green-500/10 text-green-400 border-green-500/20",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
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
  const { getEmail, getPasswordHash } = useAuth();
  const { actor } = useActor();

  // Local admin session (separate from regular user session)
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminHash, setAdminHash] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Is there an existing app session we can use for "Register as Admin"?
  const sessionEmail = getEmail();
  const sessionHash = getPasswordHash();
  const hasAppSession = !!(sessionEmail && sessionHash);

  const isAdminLoggedIn = !!(adminEmail && adminHash);

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    refetch,
    isFetching,
  } = useGetAdminBookings(adminEmail, adminHash);

  const updateStatus = useUpdateBookingStatus();

  const sortedBookings: Booking[] = [...bookings].sort((a, b) =>
    sortNewest
      ? Number(b.timestamp - a.timestamp)
      : Number(a.timestamp - b.timestamp),
  );

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      const hash = await hashPassword(loginPassword);
      const result = await (actor as any).authenticateUser(loginEmail, hash);
      if ("ok" in result) {
        const role = result.ok;
        if (role === "admin") {
          setAdminEmail(loginEmail);
          setAdminHash(hash);
          toast.success("Admin access granted!");
        } else {
          setLoginError(
            "Access denied: your account does not have admin privileges.",
          );
          toast.error("Access denied: not an admin.");
        }
      } else {
        setLoginError(result.err || "Invalid email or password.");
        toast.error(result.err || "Invalid email or password.");
      }
    } catch {
      setLoginError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleAdminLogout() {
    setAdminEmail(null);
    setAdminHash(null);
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
  }

  async function handleRegisterAdmin() {
    if (!actor || !sessionEmail || !sessionHash) return;
    setRegisterLoading(true);
    try {
      const result = await (actor as any).registerAdmin(
        sessionEmail,
        sessionHash,
      );
      if ("ok" in result) {
        toast.success("Admin account registered! You can now log in.");
      } else {
        toast.error(result.err || "Failed to register admin.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handleUpdateStatus(bookingId: string, newStatus: string) {
    try {
      await updateStatus.mutateAsync({ bookingId, newStatus });
      toast.success(`Job marked as ${newStatus}!`);
      refetch();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status.",
      );
    }
  }

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

            {isAdminLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminLogout}
                className="border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                data-ocid="admin.secondary_button"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Logout
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

          {/* Not logged in as admin — show login form */}
          {!isAdminLoggedIn && (
            <div
              className="mx-auto max-w-md rounded-xl border border-border bg-card p-8"
              data-ocid="admin.panel"
            >
              <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-electric/10">
                  <ShieldCheck className="h-7 w-7 text-electric" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Admin Access
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sign in with your admin account to continue.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="admin-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="h-11 border-border bg-background"
                    data-ocid="admin.input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="admin-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="h-11 border-border bg-background"
                    data-ocid="admin.input"
                  />
                </div>

                {loginError && (
                  <div
                    className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-4 py-3"
                    data-ocid="admin.error_state"
                  >
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm font-medium text-destructive">
                      {loginError}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loginLoading || !actor}
                  className="h-11 w-full bg-electric font-semibold text-primary-foreground hover:bg-electric-dim"
                  data-ocid="admin.submit_button"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Verifying…
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Sign in as Admin
                    </>
                  )}
                </Button>
              </form>

              {/* Register as Admin — only visible if user has an active app session */}
              {hasAppSession && (
                <div className="mt-6 border-t border-border pt-5">
                  <p className="mb-3 text-center text-xs text-muted-foreground">
                    Logged in as{" "}
                    <span className="font-medium text-foreground">
                      {sessionEmail}
                    </span>
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-dashed border-electric/40 text-electric hover:border-electric hover:bg-electric/5"
                    onClick={handleRegisterAdmin}
                    disabled={registerLoading}
                    data-ocid="admin.open_modal_button"
                  >
                    {registerLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Registering…
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" /> Register Current
                        Account as Admin
                      </>
                    )}
                  </Button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    This grants your logged-in account admin privileges.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Admin dashboard */}
          {isAdminLoggedIn && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                    Service Bookings
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {bookings.length}{" "}
                    {bookings.length === 1 ? "booking" : "bookings"} total
                    {adminEmail && (
                      <span className="ml-2 text-electric">• {adminEmail}</span>
                    )}
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
                          Customer
                        </TableHead>
                        <TableHead className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Service
                        </TableHead>
                        <TableHead className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Problem
                        </TableHead>
                        <TableHead className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Date &amp; Time
                        </TableHead>
                        <TableHead className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Status
                        </TableHead>
                        <TableHead className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Actions
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
                          <TableCell className="max-w-[120px]">
                            <p className="truncate text-xs text-muted-foreground">
                              {booking.userEmail}
                            </p>
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
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium capitalize ${
                                STATUS_STYLES[booking.status] ??
                                "bg-muted/50 text-foreground border-border"
                              }`}
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1.5">
                              {booking.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 border-blue-500/30 px-2 text-xs text-blue-400 hover:border-blue-500 hover:bg-blue-500/10"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      booking.bookingId,
                                      "accepted",
                                    )
                                  }
                                  disabled={updateStatus.isPending}
                                  data-ocid={`admin.edit_button.${idx + 1}`}
                                >
                                  Accept
                                </Button>
                              )}
                              {booking.status === "accepted" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 border-green-500/30 px-2 text-xs text-green-400 hover:border-green-500 hover:bg-green-500/10"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      booking.bookingId,
                                      "completed",
                                    )
                                  }
                                  disabled={updateStatus.isPending}
                                  data-ocid={`admin.save_button.${idx + 1}`}
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />{" "}
                                  Complete
                                </Button>
                              )}
                              {booking.status === "completed" && (
                                <span className="text-xs text-green-400">
                                  ✓ Done
                                </span>
                              )}
                            </div>
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
