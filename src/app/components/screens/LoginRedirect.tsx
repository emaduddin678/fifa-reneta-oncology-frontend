import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AlertCircle, ChevronRight } from "lucide-react";
import {
  getToken,
  redirectToCancerCareSso,
} from "@/app/lib/auth";

/**
 * The game has NO login screen of its own — all sign-in happens on
 * cancercare.pro. Anything that lands on /login is immediately bounced to
 * cancercare.pro/game/sso (its login page if no session, then straight back
 * into the game with a one-time code).
 *
 * The only thing ever rendered here is the failure state (?sso=failed), which
 * requires a user click to retry — that's what prevents redirect loops.
 */
export default function LoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const failed = searchParams.get("sso") === "failed";

  useEffect(() => {
    if (getToken()) {
      navigate("/home", { replace: true });
      return;
    }
    if (!failed) {
      redirectToCancerCareSso();
    }
  }, [failed, navigate]);

  if (!failed) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#1E90FF]/30 border-t-[#1E90FF] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#1A1A2E]/70">
          Taking you to Cancer Care sign-in…
        </p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center px-4">
      <div
        className="w-full max-w-[400px] bg-white/95 rounded-3xl border border-black/15 p-8 text-center"
        style={{
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        }}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-lg font-black text-[#1A1A2E]">
          Automatic sign-in failed
        </h1>
        <p className="text-[13px] leading-relaxed text-[#1A1A2E]/60 mt-2">
          We couldn't sign you in through Cancer Care. Please try again — you
          may need to log in on the Cancer Care website first.
        </p>
        <button
          type="button"
          onClick={() => redirectToCancerCareSso()}
          className="cursor-pointer mt-5 flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl text-white font-black text-xs tracking-widest uppercase transition-all duration-150 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #1E90FF 0%, #0066CC 100%)",
          }}
        >
          Try Again
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
