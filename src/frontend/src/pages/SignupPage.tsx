import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { hashPassword } from "../utils/hashPassword";

interface SignupPageProps {
  onAuthSuccess: () => void;
  onGoToLogin: () => void;
  loginFn: (email: string) => void;
}

export default function SignupPage({
  onAuthSuccess,
  onGoToLogin,
  loginFn,
}: SignupPageProps) {
  const { actor, isFetching } = useActor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor || isFetching) return;
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const hash = await hashPassword(password);
      const result = await (actor as any).registerUser(email, hash);
      if ("ok" in result) {
        loginFn(email);
        onAuthSuccess();
      } else {
        setError(result.err || "Registration failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-10">
      {/* Subtle background decoration */}
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
        {/* Branding hero */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-primary opacity-20 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Zap
                className="h-10 w-10 text-primary-foreground"
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
          {/* Form heading */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Create Account
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Register to book electrical services
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="signup-email"
                className="text-sm font-medium text-foreground"
              >
                Email Address
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                data-ocid="signup.input"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="signup-password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-12 border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                data-ocid="signup.input"
              />
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="signup-confirm"
                className="text-sm font-medium text-foreground"
              >
                Confirm Password
              </Label>
              <Input
                id="signup-confirm"
                type="password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="h-12 border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                data-ocid="signup.input"
              />
            </div>

            {/* Error */}
            {error && (
              <p
                className="rounded-lg border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive"
                data-ocid="signup.error_state"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || isFetching}
              className="mt-1 h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-electric-dim hover:shadow-md disabled:opacity-50"
              data-ocid="signup.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Login link */}
        <p className="-mt-3 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onGoToLogin}
            className="font-semibold text-primary underline-offset-4 hover:underline"
            data-ocid="signup.link"
          >
            Sign In
          </button>
        </p>

        {/* Footer */}
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
