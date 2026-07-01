import RenataOnco from "@/imports/RenataOnco-100kb.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Crosshair,
  Flame,
  CalendarDays,
  Gamepad2,
  LogOut,
  BadgeHelp,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { logoutDoctor } from "@/app/lib/auth";

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color.replace(
    /rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/,
    `rgba($1,$2,$3,${alpha})`,
  );
}

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  async function handleLogout() {
    await logoutDoctor();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  }

  const quickActions = [
    {
      icon: Crosshair,
      label: "PREDICTION",
      subtitle: "Predict match results",
      route: "/predict",
      iconColor: "#1E90FF",
    },
    {
      icon: Flame,
      label: "HIGHLIGHTS",
      subtitle: "Latest match clips",
      route: "/highlights",
      iconColor: "rgba(255,255,255,0.6)",
    },
    {
      icon: BadgeHelp,
      label: "TRIVIA QUIZ",
      subtitle: "Test your knowledge",
      route: "/quiz",
      iconColor: "rgba(255,255,255,0.6)",
    },
    {
      icon: Gamepad2,
      label: "MINI GAME",
      subtitle: "Play & earn points",
      route: "/game",
      iconColor: "rgba(255,255,255,0.6)",
    },
    {
      icon: TrendingUp,
      label: "LEADERBOARD",
      subtitle: "Top performers",
      route: "/leaderboard",
      iconColor: "#FFD700",
    },
    {
      icon: CalendarDays,
      label: "FIXTURE",
      subtitle: "Match schedule",
      route: "/fixture",
      iconColor: "rgba(255,255,255,0.6)",
    },
  ];

  return (
    <>
      {/*
        MOBILE  (<640px): h-[100dvh] flex-col — locks to viewport, no scroll,
                          grid rows stretch via flex-1 to fill remaining space.
        DESKTOP (≥640px): revert to min-h-screen block — cards use their
                          natural min-h-[80px] height, no stretching.
      */}
      <div
        className="
        h-[100dvh] flex flex-col
        sm:h-auto sm:min-h-screen sm:block
        relative overflow-hidden bg-[#0A0E1A]
      "
      >
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A] via-[#10172A] to-[#0A0E1A]" />
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            onClick={() => setShowLogoutModal(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              className="relative z-10 w-full max-w-[320px] bg-[#0D1526] border border-white/10 rounded-3xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
              style={{
                animation:
                  "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#CC2936]/10 border border-[#CC2936]/20 flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-7 h-7 text-[#CC2936]" />
              </div>
              <h2 className="text-white font-bold text-lg text-center mb-1">
                Sign out?
              </h2>
              <p className="text-white/40 text-sm text-center mb-6">
                You'll need to sign back in to access the festival.
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-[#CC2936]/90 hover:bg-[#CC2936] text-white font-bold text-sm py-3 rounded-2xl mb-3 transition-colors"
              >
                Yes, sign out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-semibold text-sm py-3 rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── HEADER ── flex-shrink-0 so it never compresses on mobile */}
        <div
          className="relative z-10 px-4 pt-5 pb-3 flex flex-col items-center flex-shrink-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          <button
            onClick={() => setShowLogoutModal(true)}
            className="cursor-pointer absolute top-4 right-4 flex items-center gap-1 text-white/40 text-xs underline active:text-white/60 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign out
          </button>

          {/* Logo: 120px on mobile, 160px on desktop */}
          <div className="w-[120px] sm:w-[160px] flex items-center justify-center mb-2">
            <ImageWithFallback
              src={RenataOnco}
              alt="Renata Oncology Logo"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="text-[10px] tracking-widest font-bold text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full px-4 py-1">
            FIFA WORLD CUP FESTIVAL 2026
          </div>
        </div>

        {/*
          ── GRID WRAPPER ──
          Mobile:  flex-1 + flex-col → grid fills all remaining viewport height
          Desktop: normal block with pb-10 → grid rows use natural height
        */}
        <div
          className="
          relative z-10 px-3 mt-2
          flex-1 flex flex-col min-h-0 pb-3
          sm:flex-none sm:block sm:pb-10
        "
        >
          <div
            className="
  grid grid-cols-2 gap-2 max-w-[800px] mx-auto w-full
  flex-1 items-start content-start
  sm:flex-none sm:items-stretch sm:content-normal
"
          >
            {quickActions.map((action, index) => {
              const tileStyle = {
                transitionDelay: `${120 + index * 60}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              };

              return (
                <button
                  key={index}
                  onClick={() => navigate(action.route)}
                  style={tileStyle}
                  className="
                    bg-[#0D1526] border border-white/[0.07] rounded-2xl
                    active:scale-[0.97] transition-transform
                    hover:bg-white/[0.04]

                    /* MOBILE: icon top-left, text below — full width, no truncation */
                    flex items-center gap-1.5 px-3 py-3

                    /* DESKTOP: revert to original horizontal row layout */
                    flex-row sm:items-center sm:gap-3 sm:min-h-[80px] sm:py-0
                  "
                >
                  {/* Icon pill */}
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: withAlpha(action.iconColor, 0.1),
                    }}
                  >
                    <action.icon
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: action.iconColor }}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Text block — no truncate ever */}
                  <div className="flex-1 text-left w-full">
                    <div
                      className="
                      font-bold text-white tracking-wide uppercase leading-tight
                      text-[10px] sm:text-sm
                    "
                    >
                      {action.label}
                    </div>
                    <div
                      className="
                      text-white/40 font-normal leading-tight mt-0.5
                      text-[9px] sm:text-[11px]
                    "
                    >
                      {action.subtitle}
                    </div>
                  </div>

                  {/* Chevron: desktop only */}
                  <ChevronRight className="hidden sm:block w-4 h-4 text-white/20 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center text-white/15 text-[9px] tracking-wider py-2 flex-shrink-0">
          RENATA ONCOLOGY · FIFA WORLD CUP FESTIVAL 2026
        </div>
      </div>
    </>
  );
}
