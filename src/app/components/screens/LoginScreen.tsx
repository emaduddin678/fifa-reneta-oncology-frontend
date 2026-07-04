import RenataOnco from "@/imports/RenataOnco-100kb.png";
import bgMobile from "@/imports/Fifa_Worldcup_bg_mobile.png";
import bgDesktop from "@/imports/Fifa_Worldcup_bg_Desktop.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ChevronRight,
  AlertCircle,
  KeyRound,
  ExternalLink,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { loginDoctor, setAuth } from "@/app/lib/auth";
import { ImageWithFallback } from "../figma/ImageWithFallback";

// The Cancer Care site owns all account/password management; a password change
// there auto-syncs to this game login. Override via VITE_CANCERCARE_URL.
const CANCERCARE_URL =
  import.meta.env.VITE_CANCERCARE_URL ?? "https://cancercare.pro";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Close the "forgot password" info modal on Escape.
  useEffect(() => {
    if (!showForgotModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowForgotModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForgotModal]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setIsError(false);
    try {
      const { token, user } = await loginDoctor(username, password);
      setAuth(token, user);

      if (user.isRegistered) {
        toast.success("Welcome back!");
        navigate("/home", { replace: true });
      } else {
        toast.success("Login successful! Please complete your profile.");
        navigate("/register", { replace: true });
      }
    } catch (err) {
      setIsError(true);
      setIsShaking(true);
      setIsLoading(false);
      setTimeout(() => setIsShaking(false), 500);
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden flex flex-col items-center justify-center px-4">
      <style>{`
        @keyframes ctaPulse {
          0%   { box-shadow: 0 8px 32px rgba(30,144,255,0.4), 0 0 0 0 rgba(30,144,255,0.4); }
          70%  { box-shadow: 0 8px 32px rgba(30,144,255,0.4), 0 0 0 16px rgba(30,144,255,0); }
          100% { box-shadow: 0 8px 32px rgba(30,144,255,0.4), 0 0 0 0 rgba(30,144,255,0); }
        }
        @keyframes loginShake {
          0%, 100% { transform: translateX(0); }
          15%      { transform: translateX(-6px); }
          30%      { transform: translateX(6px); }
          45%      { transform: translateX(-4px); }
          60%      { transform: translateX(4px); }
          75%      { transform: translateX(-2px); }
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cta-pulse { animation: ctaPulse 2.5s ease-out infinite; animation-delay: 1200ms; }
        .card-shake { animation: loginShake 0.5s ease-in-out; }
        .overlay-in { animation: overlayIn 0.2s ease forwards; }
        .modal-in { animation: modalIn 0.28s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>

      {/* Background — same layered stadium/brushstroke/silhouette artwork as landing */}
      <div
        className="absolute inset-0 z-0 sm:hidden"
        style={{
          backgroundImage: `url(${bgMobile})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        className="absolute inset-0 z-0 hidden sm:block"
        style={{
          backgroundImage: `url(${bgDesktop})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Login card */}
      <div
        className={`relative z-30 w-full max-w-[400px] bg-white/95 rounded-3xl border border-black/15 p-8 sm:p-10 ${isShaking ? "card-shake" : ""}`}
        style={{
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.97)",
          transition:
            "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          transitionDelay: "100ms",
        }}
      >
        {/* Logo lockup */}
        <div
          className="flex flex-col items-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-12px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            transitionDelay: "200ms",
          }}
        >
          <div className="w-[100px] mb-1">
            <ImageWithFallback
              src={RenataOnco}
              alt="Renata Oncology"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-[#1E90FF] text-[11px] font-black tracking-[0.15em] uppercase">
            FIFA World Cup
          </p>
          <p className="text-[#1A1A2E]/50 text-[10px] font-medium tracking-widest uppercase">
            Festival 2026
          </p>
        </div>

        <div className="w-12 h-px bg-black/10 mx-auto my-4" />

        {/* Heading */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease",
            transitionDelay: "350ms",
          }}
        >
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight text-center">
            Welcome Back
          </h1>
          <p className="text-xs text-[#1A1A2E]/50 text-center mt-1 mb-6">
            Enter your credentials to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Username */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              transitionDelay: "420ms",
            }}
          >
            <div className="flex items-center mb-1.5 ml-1">
              <User className="w-3.5 h-3.5 text-[#1A1A2E]/50" />
              <span className="text-xs font-semibold text-[#1A1A2E]/70 tracking-wide uppercase ml-1">
                Username
              </span>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className={`w-full rounded-2xl px-4 py-3.5 text-sm text-[#1A1A2E] bg-gray-50 placeholder:text-black/30 outline-none transition-all duration-200 focus:border-[#1E90FF]/60 focus:ring-2 focus:ring-[#1E90FF]/15 focus:bg-white ${
                isError ? "border-red-400/60" : "border-black/10"
              }`}
              style={{
                borderWidth: 1,
                borderStyle: "solid",
              }}
              required
            />
          </div>

          {/* Password */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              transitionDelay: "480ms",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center ml-1">
                <Lock className="w-3.5 h-3.5 text-[#1A1A2E]/50" />
                <span className="text-xs font-semibold text-[#1A1A2E]/70 tracking-wide uppercase ml-1">
                  Password
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="cursor-pointer text-xs text-[#1E90FF] font-medium hover:text-[#0066CC] transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full rounded-2xl px-4 py-3.5 pr-11 text-sm text-[#1A1A2E] bg-gray-50 placeholder:text-black/30 outline-none transition-all duration-200 focus:border-[#1E90FF]/60 focus:ring-2 focus:ring-[#1E90FF]/15 focus:bg-white ${
                  isError ? "border-red-400/60" : "border-black/10"
                }`}
                style={{
                  borderWidth: 1,
                  borderStyle: "solid",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A2E]/30 hover:text-[#1A1A2E]/60 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {isError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-xs text-red-600">
                Invalid username or password.
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!username || !password || isLoading}
            className={` cursor-pointer cta-pulse flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl text-white font-black text-sm tracking-widest uppercase transition-all duration-150 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-80`}
            style={{
              background: "linear-gradient(135deg, #1E90FF 0%, #0066CC 100%)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              transitionDelay: "560ms",
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Login
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Trust footer */}
        <div
          className="flex items-center justify-center gap-4 mt-4"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease",
            transitionDelay: "640ms",
          }}
        >
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#1A1A2E]/40" />
            <span className="text-[9px] text-[#1A1A2E]/40 font-medium tracking-wide">
              Secure &amp; encrypted
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#1A1A2E]/40" />
            <span className="text-[9px] text-[#1A1A2E]/40 font-medium tracking-wide">
              HIPAA compliant
            </span>
          </div>
        </div>
      </div>

      {/* XRI credit */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-30">
        <p className="text-[10px] text-white/70 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          Developed by{" "}
          <a
            href="https://xri.com.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold"
          >
            XR Interactive
          </a>
        </p>
      </div>

      {/* Forgot-password info modal — the game has no password management of its
          own; passwords live on the Cancer Care site and auto-sync here. */}
      {showForgotModal && (
        <div
          className="overlay-in fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(10,10,20,0.5)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          onClick={() => setShowForgotModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
        >
          <div
            className="modal-in relative w-full max-w-[360px] bg-white/95 rounded-3xl border border-black/15 p-7"
            style={{
              backdropFilter: "blur(24px) saturate(1.4)",
              WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              aria-label="Close"
              className="cursor-pointer absolute right-4 top-4 text-[#1A1A2E]/40 hover:text-[#1A1A2E]/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #1E90FF 0%, #0066CC 100%)",
                boxShadow: "0 8px 24px rgba(30,144,255,0.4)",
              }}
            >
              <KeyRound className="w-6 h-6 text-white" />
            </div>

            <h2
              id="forgot-modal-title"
              className="text-lg font-black text-[#1A1A2E] text-center"
            >
              Password Managed by Cancer Care
            </h2>
            <p className="text-center text-[13px] leading-relaxed text-[#1A1A2E]/60 mt-2">
              Your account and password are managed on the{" "}
              <span className="font-semibold text-[#1A1A2E]">Cancer Care</span>{" "}
              website. To reset or change your password, please do it there —
              the change updates your login here automatically.
            </p>

            {/* Actions */}
            <a
              href={CANCERCARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowForgotModal(false)}
              className="cursor-pointer mt-5 flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl text-white font-black text-xs tracking-widest uppercase transition-all duration-150 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #1E90FF 0%, #0066CC 100%)",
              }}
            >
              Go to Cancer Care
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="cursor-pointer mt-2.5 w-full py-2.5 text-xs font-semibold text-[#1A1A2E]/50 hover:text-[#1A1A2E]/80 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
