import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wrench, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { hashPassword } from "../utils/hashPassword";

interface TechnicianLoginPageProps {
  onLoginSuccess: (email: string) => void;
}

export default function TechnicianLoginPage({
  onLoginSuccess,
}: TechnicianLoginPageProps) {
  const { actor, isFetching } = useActor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (isFetching) {
      setError("Server se connect ho raha hai, thoda ruko...");
      return;
    }

    if (!actor) {
      setError("Server se connect nahi ho pa raha. Page refresh karo.");
      toast.error("Connection error. Please refresh the page.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Email aur password dono bharein.");
      return;
    }

    setLoading(true);
    try {
      const hash = await hashPassword(password);
      const result = await (actor as any).authenticateUser(email.trim(), hash);
      if ("ok" in result) {
        sessionStorage.setItem("mes_tech_email", email.trim());
        sessionStorage.setItem("mes_tech_password", hash);
        toast.success("Technician login successful!");
        onLoginSuccess(email.trim());
      } else {
        const msg = result.err || "Invalid email or password.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const isButtonDisabled = loading || isFetching;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-primary opacity-[0.04] blur-2xl" />
      </div>

      <motion.div
        className="relative flex w-full max-w-[400px] flex-col gap-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Branding */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-primary opacity-20 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Zap
                className="h-8 w-8 text-primary-foreground"
                fill="currentColor"
              />
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              MES Infratech
            </h1>
            <p className="mt-1 text-sm font-medium tracking-wide text-muted-foreground">
              Madhavi Electrical Solutions
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/80 px-6 py-7 shadow-sm backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Technician Login
              </h2>
              <p className="text-sm text-muted-foreground">
                MES Infratech — Staff Portal
              </p>
            </div>
          </div>

          {isFetching && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Server se connect ho raha hai...
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="tech-email"
                className="text-sm font-medium text-foreground"
              >
                Email Address
              </Label>
              <Input
                id="tech-email"
                type="email"
                placeholder="technician@mes.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                data-ocid="tech_login.input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="tech-password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="tech-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-12 border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                data-ocid="tech_login.input"
              />
            </div>

            {error && (
              <p
                className="rounded-lg border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive"
                data-ocid="tech_login.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isButtonDisabled}
              className="mt-1 h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50"
              data-ocid="tech_login.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting…
                </>
              ) : (
                "Sign In as Technician"
              )}
            </Button>
          </form>
        </div>

        <p className="-mt-3 text-center text-xs text-muted-foreground">
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
      </motion.div>
    </div>
  );
}
