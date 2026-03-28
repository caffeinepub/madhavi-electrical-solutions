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
import {
  ArrowDownUp,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock,
  DollarSign,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Booking } from "../backend";
import { useActor } from "../hooks/useActor";
import { useAuth } from "../hooks/useAuth";
import {
  type Technician,
  useAddTechnician,
  useAssignTechnician,
  useGetAdminBookings,
  useGetTechnicians,
  useUpdateBookingStatus,
} from "../hooks/useQueries";
import { hashPassword } from "../utils/hashPassword";

// Extend Booking to include assignedTechnician from backend
type BookingEx = Booking & { assignedTechnician?: string };

// ─── helpers ────────────────────────────────────────────────────────────────

const SERVICE_COLORS: Record<string, string> = {
  "Electric Repair": "bg-red-50 text-red-700 border-red-200",
  Wiring: "bg-blue-50 text-blue-700 border-blue-200",
  "Panel Work": "bg-purple-50 text-purple-700 border-purple-200",
  Maintenance: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function statusMeta(status: string) {
  if (status === "pending")
    return {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  if (status === "accepted" || status === "in-progress")
    return {
      label: "In Progress",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  if (status === "completed")
    return {
      label: "Completed",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  return {
    label: status,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };
}

function formatDateTime(ts: bigint): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(Number(ts)));
}

function statusToSelectValue(status: string): string {
  if (status === "pending") return "Pending";
  if (status === "accepted" || status === "in-progress") return "In Progress";
  if (status === "completed") return "Completed";
  return "Pending";
}

// ─── stat card ──────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm flex items-center gap-4 ${accent}`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ─── booking card (mobile only) ─────────────────────────────────────────────

interface BookingCardProps {
  booking: BookingEx;
  index: number;
  onUpdateStatus: (id: string, status: string) => void;
  isPending: boolean;
  technicians: Technician[];
  onAssign: (bookingId: string, techName: string) => void;
}

function BookingCard({
  booking,
  index,
  onUpdateStatus,
  isPending,
  technicians,
  onAssign,
}: BookingCardProps) {
  const storagePrefix = `mes_booking_${booking.bookingId}`;

  const [paid, setPaid] = useState(
    () => localStorage.getItem(`${storagePrefix}_paid`) === "true",
  );
  const [selectedTech, setSelectedTech] = useState("");

  const assignedTech = booking.assignedTechnician ?? "";

  const { label: statusLabel, className: statusClass } = statusMeta(
    booking.status,
  );
  const serviceClass =
    SERVICE_COLORS[booking.serviceType] ??
    "bg-gray-50 text-gray-700 border-gray-200";

  function handleAssign() {
    if (!selectedTech) return;
    onAssign(booking.bookingId, selectedTech);
    setSelectedTech("");
  }

  function togglePayment() {
    const next = !paid;
    setPaid(next);
    localStorage.setItem(`${storagePrefix}_paid`, String(next));
    toast.success(next ? "Marked as Paid" : "Marked as Unpaid");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
      data-ocid={`admin.item.${index + 1}`}
    >
      {/* top accent strip based on status */}
      <div
        className={`h-1 w-full rounded-t-xl ${
          booking.status === "completed"
            ? "bg-emerald-400"
            : booking.status === "accepted"
              ? "bg-blue-400"
              : "bg-amber-400"
        }`}
      />

      <div className="p-5">
        {/* header row */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="h-4 w-4 shrink-0 text-blue-500" />
            <span className="truncate text-sm font-semibold text-gray-800">
              {booking.userEmail}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-xs font-medium ${serviceClass}`}
            >
              {booking.serviceType}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${statusClass}`}
            >
              {statusLabel}
            </Badge>
          </div>
        </div>

        {/* description */}
        <p className="line-clamp-2 text-sm text-gray-600 mb-3">
          {booking.description}
        </p>

        {/* date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>{booking.dateTime || formatDateTime(booking.timestamp)}</span>
        </div>

        {/* divider */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          {/* technician assignment */}
          <div>
            {assignedTech ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {assignedTech}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="h-7 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    data-ocid={`admin.select.${index + 1}`}
                  >
                    <option value="">Change…</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {selectedTech && (
                    <Button
                      size="sm"
                      onClick={handleAssign}
                      className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2"
                      data-ocid={`admin.save_button.${index + 1}`}
                    >
                      <Wrench className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  data-ocid={`admin.select.${index + 1}`}
                >
                  <option value="">— Select Technician —</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={handleAssign}
                  disabled={!selectedTech}
                  className="h-8 shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3"
                  data-ocid={`admin.save_button.${index + 1}`}
                >
                  <Wrench className="h-3 w-3 mr-1" /> Assign
                </Button>
              </div>
            )}
          </div>

          {/* payment + status actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* payment toggle */}
            <button
              type="button"
              onClick={togglePayment}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                paid
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
              }`}
              data-ocid="admin.toggle"
            >
              <DollarSign className="h-3 w-3" />
              {paid ? "Paid" : "Unpaid"}
            </button>

            {/* status progression */}
            {booking.status === "pending" && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(booking.bookingId, "accepted")}
                disabled={isPending}
                className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3"
                data-ocid={`admin.edit_button.${index + 1}`}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Clock className="h-3 w-3 mr-1" />
                )}
                Mark In Progress
              </Button>
            )}
            {(booking.status === "accepted" ||
              booking.status === "in-progress") && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(booking.bookingId, "completed")}
                disabled={isPending}
                className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3"
                data-ocid={`admin.save_button.${index + 1}`}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                )}
                Mark Completed
              </Button>
            )}
            {booking.status === "completed" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── desktop table row ───────────────────────────────────────────────────────

interface BookingTableRowProps {
  booking: BookingEx;
  index: number;
  onUpdateStatus: (id: string, status: string) => void;
  technicians: Technician[];
  onAssign: (bookingId: string, techName: string) => void;
}

function BookingTableRow({
  booking,
  index,
  onUpdateStatus,
  technicians,
  onAssign,
}: BookingTableRowProps) {
  const assignedTech = booking.assignedTechnician ?? "";

  const { label: statusLabel, className: statusClass } = statusMeta(
    booking.status,
  );
  const serviceClass =
    SERVICE_COLORS[booking.serviceType] ??
    "bg-gray-50 text-gray-700 border-gray-200";

  const currentStatusValue = statusToSelectValue(booking.status);

  function handleTechChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (!val) return;
    onAssign(booking.bookingId, val);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "Pending") {
      toast.warning("Cannot revert to pending");
      return;
    }
    if (val === "In Progress") {
      onUpdateStatus(booking.bookingId, "accepted");
    } else if (val === "Completed") {
      onUpdateStatus(booking.bookingId, "completed");
    }
  }

  const truncatedDesc =
    booking.description.length > 60
      ? `${booking.description.slice(0, 60)}…`
      : booking.description;

  return (
    <TableRow
      className="hover:bg-gray-50 border-b border-gray-100"
      data-ocid={`admin.row.${index + 1}`}
    >
      {/* Customer Email */}
      <TableCell className="py-3 px-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <Mail className="h-3.5 w-3.5 shrink-0 text-blue-400" />
          <span className="text-xs font-medium text-gray-800 truncate max-w-[160px]">
            {booking.userEmail}
          </span>
        </div>
      </TableCell>

      {/* Service Type */}
      <TableCell className="py-3 px-4">
        <Badge
          variant="outline"
          className={`text-xs font-medium whitespace-nowrap ${serviceClass}`}
        >
          {booking.serviceType}
        </Badge>
      </TableCell>

      {/* Problem */}
      <TableCell className="py-3 px-4 max-w-[200px]">
        <span
          title={booking.description}
          className="text-xs text-gray-600 leading-relaxed cursor-default"
        >
          {truncatedDesc}
        </span>
      </TableCell>

      {/* Date & Time */}
      <TableCell className="py-3 px-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="text-xs text-gray-600">
            {booking.dateTime || formatDateTime(booking.timestamp)}
          </span>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="py-3 px-4">
        <Badge
          variant="outline"
          className={`text-xs font-semibold whitespace-nowrap ${statusClass}`}
        >
          {statusLabel}
        </Badge>
      </TableCell>

      {/* Assigned Technician */}
      <TableCell className="py-3 px-4">
        {assignedTech ? (
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
              {assignedTech}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 px-4">
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          {/* Assign Technician */}
          <select
            value={assignedTech}
            onChange={handleTechChange}
            className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            data-ocid={`admin.select.${index + 1}`}
          >
            <option value="">— Assign —</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Change Status */}
          <select
            value={currentStatusValue}
            onChange={handleStatusChange}
            className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            data-ocid={`admin.select.${index + 1}`}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Add Technician Form ─────────────────────────────────────────────────────

interface AddTechnicianFormProps {
  onAdd: (name: string, email: string) => Promise<void>;
  isAdding: boolean;
}

function AddTechnicianForm({ onAdd, isAdding }: AddTechnicianFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd(name.trim(), email.trim());
    setName("");
    setEmail("");
    setOpen(false);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-800"
        data-ocid="admin.open_modal_button"
      >
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          Manage Technicians
        </span>
        <Plus
          className={`h-4 w-4 text-blue-600 transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="mt-4 flex flex-wrap gap-3 items-end"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                <Label
                  htmlFor="tech-name"
                  className="text-xs font-medium text-gray-600"
                >
                  Technician Name *
                </Label>
                <Input
                  id="tech-name"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-9 text-sm border-gray-200"
                  data-ocid="admin.input"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                <Label
                  htmlFor="tech-email"
                  className="text-xs font-medium text-gray-600"
                >
                  Email (optional)
                </Label>
                <Input
                  id="tech-email"
                  type="email"
                  placeholder="technician@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm border-gray-200"
                  data-ocid="admin.input"
                />
              </div>
              <Button
                type="submit"
                disabled={isAdding || !name.trim()}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 shrink-0"
                data-ocid="admin.submit_button"
              >
                {isAdding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                )}
                Add Technician
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { getEmail, getPasswordHash } = useAuth();
  const { actor } = useActor();

  // Restore admin session from sessionStorage (set by AdminLoginPage after /admin-login)
  const [adminEmail, setAdminEmail] = useState<string | null>(
    () => sessionStorage.getItem("mes_admin_session") ?? null,
  );
  const [adminHash, setAdminHash] = useState<string | null>(
    () => sessionStorage.getItem("mes_admin_hash") ?? null,
  );

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);

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

  const { data: technicians = [] } = useGetTechnicians();
  const updateStatus = useUpdateBookingStatus();
  const assignTechnician = useAssignTechnician();
  const addTechnician = useAddTechnician();

  const bookingsEx = bookings as BookingEx[];

  const sortedBookings: BookingEx[] = [...bookingsEx].sort((a, b) =>
    sortNewest
      ? Number(b.timestamp - a.timestamp)
      : Number(a.timestamp - b.timestamp),
  );

  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const completedCount = bookings.filter(
    (b) => b.status === "completed",
  ).length;

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      const hash = await hashPassword(loginPassword);
      const result = await (actor as any).authenticateUser(loginEmail, hash);
      if ("ok" in result) {
        if (result.ok === "admin") {
          sessionStorage.setItem("mes_admin_session", loginEmail);
          sessionStorage.setItem("mes_admin_hash", hash);
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
    sessionStorage.removeItem("mes_admin_session");
    sessionStorage.removeItem("mes_admin_hash");
    setAdminEmail(null);
    setAdminHash(null);
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    window.location.href = "/admin-login";
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
      toast.success(
        `Job marked as ${newStatus === "accepted" ? "In Progress" : "Completed"}!`,
      );
      refetch();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status.",
      );
    }
  }

  async function handleAssignTechnician(bookingId: string, techName: string) {
    try {
      await assignTechnician.mutateAsync({
        bookingId,
        technicianName: techName,
      });
      toast.success(`Technician "${techName}" assigned!`);
      refetch();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign technician.",
      );
    }
  }

  async function handleAddTechnician(name: string, email: string) {
    try {
      await addTechnician.mutateAsync({ name, email });
      toast.success(`Technician "${name}" added!`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add technician.",
      );
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
              <Zap className="h-5 w-5" fill="currentColor" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">
                MES Infratech
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
            </div>
          </div>

          {/* right actions */}
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
              data-ocid="nav.link"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Home
            </a>

            {isAdminLoggedIn && (
              <>
                <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 max-w-[160px] truncate">
                    {adminEmail}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdminLogout}
                  className="border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50 text-xs"
                  data-ocid="admin.secondary_button"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" /> Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          {/* ── Login form ── */}
          {!isAdminLoggedIn && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="mx-auto max-w-md"
            >
              {/* page heading */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Portal
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Madhavi Electrical Solutions — Secure Access
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Use{" "}
                  <a
                    href="/admin-login"
                    className="text-blue-600 hover:underline"
                  >
                    /admin-login
                  </a>{" "}
                  for dedicated admin login
                </p>
              </div>

              <div
                className="rounded-2xl border border-gray-200 bg-white shadow-md p-8"
                data-ocid="admin.panel"
              >
                {/* icon */}
                <div className="mb-6 flex flex-col items-center gap-3 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Admin Login
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Sign in to manage bookings
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleAdminLogin}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="admin-email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-11 border-gray-200"
                      data-ocid="admin.input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="admin-password"
                      className="text-sm font-medium text-gray-700"
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
                      className="h-11 border-gray-200"
                      data-ocid="admin.input"
                    />
                  </div>

                  {loginError && (
                    <div
                      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                      data-ocid="admin.error_state"
                    >
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <p className="text-sm text-red-700">{loginError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loginLoading || !actor}
                    className="h-11 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
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

                {hasAppSession && (
                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <p className="mb-3 text-center text-xs text-gray-500">
                      Logged in as{" "}
                      <span className="font-semibold text-gray-700">
                        {sessionEmail}
                      </span>
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 text-sm"
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
                          <UserPlus className="mr-2 h-4 w-4" /> Register Account
                          as Admin
                        </>
                      )}
                    </Button>
                    <p className="mt-2 text-center text-xs text-gray-400">
                      Grants your current session account admin privileges.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Dashboard ── */}
          {isAdminLoggedIn && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* page title */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  MES Infratech — All service bookings overview
                </p>
              </div>

              {/* ── Stat cards ── */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                <StatCard
                  label="Total Bookings"
                  value={totalCount}
                  icon={<ClipboardList className="h-6 w-6" />}
                  accent="border-blue-100"
                />
                <StatCard
                  label="Pending Jobs"
                  value={pendingCount}
                  icon={<Clock className="h-6 w-6" />}
                  accent="border-amber-100"
                />
                <StatCard
                  label="Completed Jobs"
                  value={completedCount}
                  icon={<CheckCircle2 className="h-6 w-6" />}
                  accent="border-emerald-100"
                />
              </div>

              {/* ── Add Technician Section ── */}
              <AddTechnicianForm
                onAdd={handleAddTechnician}
                isAdding={addTechnician.isPending}
              />

              {/* ── Filter / sort bar ── */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-700">
                  {sortedBookings.length}{" "}
                  {sortedBookings.length === 1 ? "booking" : "bookings"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortNewest(!sortNewest)}
                    className="border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 text-xs"
                    data-ocid="admin.toggle"
                  >
                    <ArrowDownUp className="mr-1.5 h-3.5 w-3.5" />
                    {sortNewest ? "Newest First" : "Oldest First"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 text-xs"
                    data-ocid="admin.secondary_button"
                  >
                    <RefreshCw
                      className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* ── Content ── */}
              {bookingsLoading ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 py-24 text-center"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm text-gray-400">Loading bookings…</p>
                </div>
              ) : sortedBookings.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 text-center"
                  data-ocid="admin.empty_state"
                >
                  <ClipboardList className="h-10 w-10 text-gray-300" />
                  <div>
                    <p className="text-base font-semibold text-gray-600">
                      No bookings yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Service requests will appear here once customers submit
                      them.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mobile: card grid */}
                  <div
                    className="sm:hidden grid grid-cols-1 gap-4"
                    data-ocid="admin.list"
                  >
                    {sortedBookings.map((booking, idx) => (
                      <BookingCard
                        key={booking.bookingId}
                        booking={booking}
                        index={idx}
                        onUpdateStatus={handleUpdateStatus}
                        isPending={updateStatus.isPending}
                        technicians={technicians}
                        onAssign={handleAssignTechnician}
                      />
                    ))}
                  </div>

                  {/* Desktop: table */}
                  <div
                    className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"
                    data-ocid="admin.table"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                          <TableHead className="py-3 px-4 text-xs font-semibold text-blue-600 whitespace-nowrap">
                            Customer Email
                          </TableHead>
                          <TableHead className="py-3 px-4 text-xs font-semibold text-blue-600 whitespace-nowrap">
                            Service Type
                          </TableHead>
                          <TableHead className="py-3 px-4 text-xs font-semibold text-blue-600">
                            Problem
                          </TableHead>
                          <TableHead className="py-3 px-4 text-xs font-semibold text-blue-600 whitespace-nowrap">
                            Date & Time
                          </TableHead>
                          <TableHead className="py-3 px-4 text-xs font-semibold text-blue-600">
                            Status
                          </TableHead>
                          <TableHead className="py-3 px-4 text-xs font-semibold text-blue-600 whitespace-nowrap">
                            Assigned Technician
                          </TableHead>
                          <TableHead className="py-3 px-4 text-xs font-semibold text-blue-600">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedBookings.map((booking, idx) => (
                          <BookingTableRow
                            key={booking.bookingId}
                            booking={booking}
                            index={idx}
                            onUpdateStatus={handleUpdateStatus}
                            technicians={technicians}
                            onAssign={handleAssignTechnician}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
