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
} from "lucide-react";
import { toast } from "sonner";
import { loginDoctor, setAuth } from "@/app/lib/auth";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

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
          0%   { box-shadow: 0 8px 32px rgba(107,53,168,0.45), 0 0 0 0 rgba(107,53,168,0.4); }
          70%  { box-shadow: 0 8px 32px rgba(107,53,168,0.45), 0 0 0 16px rgba(107,53,168,0); }
          100% { box-shadow: 0 8px 32px rgba(107,53,168,0.45), 0 0 0 0 rgba(107,53,168,0); }
        }
        @keyframes loginShake {
          0%, 100% { transform: translateX(0); }
          15%      { transform: translateX(-6px); }
          30%      { transform: translateX(6px); }
          45%      { transform: translateX(-4px); }
          60%      { transform: translateX(4px); }
          75%      { transform: translateX(-2px); }
        }
        .cta-pulse { animation: ctaPulse 2.5s ease-out infinite; animation-delay: 1200ms; }
        .card-shake { animation: loginShake 0.5s ease-in-out; }
        .text-shadow { text-shadow: 0 1px 2px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3); }
        .text-shadow-lg { text-shadow: 0 2px 4px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.35); }
        .icon-shadow { filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); }
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
        className={`relative z-30 w-full max-w-[400px] rounded-3xl border border-white/25 p-8 sm:p-10 ${isShaking ? "card-shake" : ""}`}
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          boxShadow:
            "0 24px 80px rgba(107,53,168,0.25), 0 1px 0 rgba(255,255,255,0.4) inset",
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
          <p className="text-linear-gradient(135deg, #7B4FCF 0%, #4F46E5 100%) text-[11px] font-black tracking-[0.15em]  uppercase">
            FIFA World Cup
          </p>
          <p className="text-linear-gradient(135deg, #7B4FCF 0%, #4F46E5 100%) text-[10px] font-medium tracking-widest  uppercase">
            Festival 2026
          </p>
        </div>

        <div className="w-12 h-px bg-white/20 mx-auto my-4" />

        {/* Heading */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease",
            transitionDelay: "350ms",
          }}
        >
          <h1 className="text-shadow-lg text-2xl font-black text-white tracking-tight text-center">
            Welcome Back
          </h1>
          <p className="text-xs text-linear-gradient(135deg, #7B4FCF 0%, #4F46E5 100%) text-center mt-1 mb-6">
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
              <User className="icon-shadow w-3.5 h-3.5 text-white/70" />
              <span className="text-shadow text-xs font-semibold text-white tracking-wide uppercase ml-1">
                Username
              </span>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className={`w-full rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-[#A78BFA]/60 focus:ring-2 focus:ring-[#A78BFA]/15 focus:bg-white/[0.12] ${
                isError ? "border-red-400/50" : "border-white/[0.12]"
              }`}
              style={{
                background: "rgba(255,255,255,0.08)",
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
                <Lock className="icon-shadow w-3.5 h-3.5 text-white/70" />
                <span className="text-shadow text-xs font-semibold text-white tracking-wide uppercase ml-1">
                  Password
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className=" text-xs text-linear-gradient(135deg, #7B4FCF 0%, #4F46E5 100%) font-medium hover:text-[#DED0FF] transition-colors"
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
                className={`w-full rounded-2xl px-4 py-3.5 pr-11 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-[#A78BFA]/60 focus:ring-2 focus:ring-[#A78BFA]/15 focus:bg-white/[0.12] ${
                  isError ? "border-red-400/50" : "border-white/[0.12]"
                }`}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderWidth: 1,
                  borderStyle: "solid",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
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
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-300">
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
              background: "linear-gradient(135deg, #7B4FCF 0%, #4F46E5 100%)",
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
            <ShieldCheck className="icon-shadow w-3 h-3 text-white/50" />
            <span className="text-shadow text-[9px] text-white/50 font-medium tracking-wide">
              Secure &amp; encrypted
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="icon-shadow w-3 h-3 text-white/50" />
            <span className="text-shadow text-[9px] text-white/50 font-medium tracking-wide">
              HIPAA compliant
            </span>
          </div>
        </div>
      </div>

      {/* XRI credit */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-30">
        <p className="text-shadow text-[10px] text-white/40 tracking-wide">
          Developed by{" "}
          <a
            href="https://xri.com.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 font-semibold"
          >
            XR Interactive
          </a>
        </p>
      </div>
    </div>
  );
}
