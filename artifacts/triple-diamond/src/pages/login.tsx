import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useSession } from "@/contexts/session";

const AUTH_KEYS_TO_CLEAR = [
  "user",
  "auth_token",
  "user_org_id",
  "username",
  "userData",
];

export default function Login() {
  const { user, refreshSession } = useSession();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasCleared = useRef(false);

  useEffect(() => {
    if (!hasCleared.current) {
      AUTH_KEYS_TO_CLEAR.forEach((key) => localStorage.removeItem(key));
      hasCleared.current = true;
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/search");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authService.login({ email, password });
      refreshSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const tenantName = import.meta.env.VITE_TENANT_NAME || "Triple Diamond Realty";

  return (
    <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 p-8 rounded-lg border border-border bg-card">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            Sign in to {tenantName}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                id="email"
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                disabled={isLoading}
                className="w-full pl-10 pr-3 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-md text-white bg-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
