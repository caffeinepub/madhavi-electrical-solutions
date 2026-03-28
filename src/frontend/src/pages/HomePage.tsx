import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  Loader2,
  LogOut,
  Menu,
  Sparkles,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useSubmitBooking } from "../hooks/useQueries";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false);
  const { mutateAsync: submitBooking, isPending } = useSubmitBooking();
  const { logout, getEmail } = useAuth();

  const userEmail = getEmail() ?? "";

  const descriptionError = !description.trim()
    ? "Problem description is required."
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormSubmitAttempted(true);
    if (!serviceType || !description.trim() || !dateTime) return;
    try {
      await submitBooking({
        serviceType,
        description: description.trim(),
        userEmail,
        dateTime,
        timestamp: BigInt(Date.now()),
      });
      toast.success("Booking confirmed! We'll contact you shortly.");
      setSubmitted(true);
      setServiceType("");
      setDescription("");
      setDateTime("");
      setDescriptionTouched(false);
      setFormSubmitAttempted(false);
    } catch {
      toast.error("Failed to submit booking. Please try again.");
    }
  }

  const showDescriptionError =
    descriptionError && (descriptionTouched || formSubmitAttempted);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[480px] items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-3" data-ocid="nav.link">
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
                Madhavi Electrical Solutions
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/technician"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              data-ocid="nav.link"
            >
              Technician
            </Link>
            <Link
              to="/admin"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              data-ocid="nav.link"
            >
              Admin
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-border"
              data-ocid="nav.button"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {menuOpen && (
          <div className="border-t border-border bg-card px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                to="/technician"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                data-ocid="nav.link"
              >
                Technician Panel
              </Link>
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                data-ocid="nav.link"
              >
                Admin Panel
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                data-ocid="nav.button"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 py-8">
        {/* Page title */}
        <div className="mb-7">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Book a Service
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in the details below and we'll get back to you promptly.
          </p>
        </div>

        {/* Booking form / success state */}
        {submitted ? (
          <motion.div
            className="flex flex-col items-center gap-5 rounded-2xl border border-green-200 bg-gradient-to-b from-green-50 to-white px-6 py-12 text-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            data-ocid="booking.success_state"
          >
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <motion.div
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 400 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </motion.div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-foreground">
                Booking Confirmed!
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your request is{" "}
                <span className="font-semibold text-amber-600">
                  Pending Review
                </span>
                . Our team will contact you at
              </p>
              <p className="font-semibold text-foreground">{userEmail}</p>
            </div>
            <Button
              onClick={() => setSubmitted(false)}
              className="mt-2 h-12 w-full rounded-xl bg-green-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md"
              data-ocid="booking.secondary_button"
            >
              Book Another Service
            </Button>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col gap-0 rounded-2xl border border-border bg-card shadow-xs"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Section: Contact */}
            <div className="px-6 py-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Your Details
              </p>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="user-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userEmail}
                  readOnly
                  className="h-12 border-border bg-muted px-4 text-muted-foreground"
                  data-ocid="booking.email_input"
                />
              </div>
            </div>

            <Separator />

            {/* Section: Service */}
            <div className="flex flex-col gap-5 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Service Details
              </p>

              {/* Service type */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="service-select"
                  className="text-sm font-medium text-foreground"
                >
                  Service Type
                </Label>
                <Select
                  value={serviceType}
                  onValueChange={setServiceType}
                  required
                >
                  <SelectTrigger
                    id="service-select"
                    className="h-12 border-border bg-background px-4 text-foreground focus:ring-primary"
                    data-ocid="booking.select"
                  >
                    <SelectValue placeholder="Select a service…" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    <SelectItem value="Electrical Repair">
                      Electrical Repair
                    </SelectItem>
                    <SelectItem value="Wiring Installation">
                      Wiring Installation
                    </SelectItem>
                    <SelectItem value="Panel Wiring">Panel Wiring</SelectItem>
                    <SelectItem value="Maintenance Service">
                      Maintenance Service
                    </SelectItem>
                    <SelectItem value="Industrial Work">
                      Industrial Work
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Problem description */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="problem-desc"
                  className="text-sm font-medium text-foreground"
                >
                  Problem Description
                </Label>
                <Textarea
                  id="problem-desc"
                  placeholder="Describe your electrical issue in detail…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setDescriptionTouched(true)}
                  rows={4}
                  className={`resize-none border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary ${
                    showDescriptionError
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  data-ocid="booking.textarea"
                />
                {showDescriptionError && (
                  <p
                    className="flex items-center gap-1 text-xs font-medium text-destructive"
                    role="alert"
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
                    {descriptionError}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Section: Schedule */}
            <div className="px-6 py-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Schedule
              </p>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="date-time"
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  Preferred Date &amp; Time
                </Label>
                <Input
                  id="date-time"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  className="h-12 border-border bg-background px-4 text-foreground focus-visible:ring-primary"
                  data-ocid="booking.datetime_input"
                />
              </div>
            </div>

            <Separator />

            {/* Submit */}
            <div className="px-6 py-5">
              <Button
                type="submit"
                disabled={isPending}
                className="h-14 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm transition-all hover:bg-electric-dim hover:shadow-md disabled:opacity-50"
                data-ocid="booking.submit_button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Booking…
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" fill="currentColor" />
                    Book Service
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </main>

      {/* Footer */}
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
