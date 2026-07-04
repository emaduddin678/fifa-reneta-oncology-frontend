import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { exchangeSsoCode, markSsoAttempted, setAuth } from "@/app/lib/auth";

/**
 * SSO landing page. cancercare.pro redirects a logged-in user here with a
 * one-time ?code=…; we exchange it for a game token and go straight to /home —
 * no login screen. On any failure we fall back to /login (with ?sso=failed so
 * the login screen doesn't bounce back to cancercare.pro in a loop).
 */
export default function SsoScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    // React 18 StrictMode double-mount guard — the code is single-use.
    if (started.current) return;
    started.current = true;

    markSsoAttempted();
    const code = searchParams.get("code");

    if (!code) {
      navigate("/login?sso=failed", { replace: true });
      return;
    }

    exchangeSsoCode(code)
      .then(({ token, user }) => {
        setAuth(token, user);
        toast.success("Welcome back!");
        navigate(user.isRegistered ? "/home" : "/register", { replace: true });
      })
      .catch(() => {
        toast.error("Automatic sign-in failed. Please log in.");
        navigate("/login?sso=failed", { replace: true });
      });
  }, [navigate, searchParams]);

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-[#1E90FF]/30 border-t-[#1E90FF] rounded-full animate-spin" />
      <p className="text-sm font-semibold text-[#1A1A2E]/70">
        Signing you in with Cancer Care…
      </p>
    </div>
  );
}
