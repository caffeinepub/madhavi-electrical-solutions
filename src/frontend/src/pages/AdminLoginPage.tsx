import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { hashPassword } from "../utils/hashPassword";

export default function AdminLoginPage() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setConnectionError(false);

    if (isFetching) {
      setError("Server se connect ho raha hai, thoda ruko...");
      return;
    }

    if (!actor) {
      setConnectionError(true);
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
        const role = result.ok;
        if (role !== "admin") {
          setError(
            "Yeh account admin nahi hai. Sirf admin accounts yahan login kar sakte hain.",
          );
          toast.error("Admin access nahi mila.");
          return;
        }
        // Store admin session so AdminPage can restore it
        sessionStorage.setItem("mes_admin_session", email.trim());
        sessionStorage.setItem("mes_admin_hash", hash);
        toast.success("Admin login successful!");
        window.location.href = "/admin";
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

  function handleRetry() {
    queryClient.invalidateQueries({ queryKey: ["actor"] });
    setConnectionError(false);
    setError("");
  }

  const isButtonDisabled = loading || isFetching;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Blue header section */}
      <div className="rounded-b-3xl bg-blue-700 pb-16 pt-10">
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <Zap className="h-7 w-7 text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            MES Infratech
          </h1>
          <p className="text-sm text-white/80">Madhavi Electrical Solutions</p>
        </motion.div>
      </div>

      {/* Card overlapping the blue header */}
      <div className="flex flex-1 flex-col items-center px-5 pb-10">
        <motion.div
          className="-mt-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-2xl border border-blue-100 bg-white px-6 py-7 shadow-lg">
            {/* Card header */}
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <ShieldCheck className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-800">Admin Login</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Secure access for authorized personnel only
                </p>
              </div>
            </div>

            {/* Status banners */}
            {isFetching && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Server se connect ho raha hai...
              </div>
            )}

            {connectionError && !isFetching && (
              <div className="mb-4 flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-600">
                  Server se connection fail hua.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="flex w-fit items-center gap-1.5 border-red-300 text-xs text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry Connection
                </Button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  placeholder="admin@mes.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                  data-ocid="admin_login.input"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                  data-ocid="admin_login.input"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p
                    className="text-sm font-medium text-red-600"
                    data-ocid="admin_login.error_state"
                  >
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isButtonDisabled}
                className="mt-1 h-12 w-full rounded-xl bg-blue-700 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-800 disabled:opacity-50"
                data-ocid="admin_login.submit_button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                    in…
                  </>
                ) : isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  "Sign In as Admin"
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} MES Infratech. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
