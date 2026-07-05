import RenataOnco from "@/imports/RenataOnco-100kb.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Crosshair,
  Flame,
  CalendarDays,
  Gamepad2,
  ArrowLeft,
  BadgeHelp,
  TrendingUp,
  ChevronRight,
  PlayCircle,
  Gift,
  Trophy,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  function goToCancerCare() {
    window.location.href = "https://cancercare.pro";
  }

  const quickActions = [
    {
      icon: PlayCircle,
      label: "LIVE",
      subtitle: "Watch the match live",
      route: "",
      featured: true,
    },
    {
      icon: Crosshair,
      label: "PREDICTION",
      subtitle: "Predict match results",
      route: "/predict",
    },
    // {
    //   icon: Flame,
    //   label: "HIGHLIGHTS",
    //   subtitle: "Latest match clips",
    //   route: "/highlights",
    // },
    {
      icon: BadgeHelp,
      label: "TRIVIA QUIZ",
      subtitle: "Test your knowledge",
      route: "/quiz",
    },
    {
      icon: Gamepad2,
      label: "MINI GAME",
      subtitle: "Play & earn points",
      route: "/game",
    },
    {
      icon: TrendingUp,
      label: "LEADERBOARD",
      subtitle: "Top performers",
      route: "/leaderboard",
    },
    {
      icon: CalendarDays,
      label: "FIXTURE",
      subtitle: "Match schedule",
      route: "/fixture",
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
        relative overflow-hidden
      "
      >
        {/* Toffee Live Coupon Info Modal */}
        {showCouponModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            onClick={() => setShowCouponModal(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              className="relative z-10 w-full max-w-[340px] bg-white/95 border border-black/15 rounded-3xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
              style={{
                animation:
                  "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1E90FF]/10 border border-[#1E90FF]/20 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-7 h-7 text-[#1E90FF]" />
              </div>
              <h2 className="text-[#1A1A2E] font-bold text-lg text-center mb-1">
                Win a Free Toffee Live Coupon
              </h2>
              <p className="text-[#1A1A2E]/50 text-sm text-center mb-5">
                Every match day, the top 100 players on the leaderboard receive
                a free Toffee Live coupon code to stream the FIFA World Cup
                live.
              </p>
              <div className="bg-gray-50 border border-black/10 rounded-2xl p-4 mb-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[#1A1A2E]/70 text-xs">
                    Rankings are based on your combined Trivia Quiz and Mini
                    Game scores.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Gift className="w-4 h-4 text-[#1E90FF] flex-shrink-0 mt-0.5" />
                  <span className="text-[#1A1A2E]/70 text-xs">
                    Top 100 finishers get notified here with their coupon code,
                    free to redeem on Toffee Live.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCouponModal(false)}
                className="cursor-pointer w-full bg-[#1E90FF] hover:bg-[#0066CC] text-white font-bold text-sm py-3 rounded-2xl transition-colors"
              >
                Got it
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
            onClick={goToCancerCare}
            title="Back to CancerCare"
            className="cursor-pointer absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-white/95 border border-black/10 shadow-md backdrop-blur-sm px-3 py-1.5 text-[#1A1A2E] text-xs font-semibold hover:bg-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Logo: 120px on mobile, 160px on desktop */}
          <div className="w-[120px] sm:w-[160px] flex items-center justify-center mb-2">
            <ImageWithFallback
              src={RenataOnco}
              alt="Renata Oncology Logo"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="text-[10px] tracking-widest font-bold text-amber-600 bg-amber-50 border border-amber-300 rounded-full px-4 py-1">
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

              /* ── LIVE (featured) tile ── */
              if (action.featured) {
                return (
                  <button
                    key={index}
                    onClick={() => setShowCouponModal(true)}
                    style={tileStyle}
                    className="cursor-pointer py-2
                      col-span-2
                      bg-gradient-to-r from-[#1E90FF]/15 to-[#0066CC]/10
                      border-2 border-[#1E90FF] rounded-2xl
                      flex items-center gap-4 px-4
                      sm:min-h-[90px]
                      transition-all duration-150
                      hover:from-[#1E90FF]/25 hover:to-[#0066CC]/15
                      hover:shadow-[0_4px_20px_rgba(30,144,255,0.25)]
                      active:scale-[0.97]
                    "
                  >
                    <PlayCircle
                      className="w-10 h-10 sm:w-12 sm:h-12 text-[#1E90FF] flex-shrink-0"
                      strokeWidth={2}
                    />
                    <div className="flex-1 text-left">
                      <div className="text-sm sm:text-base font-black text-[#1A1A2E] tracking-wide leading-tight uppercase">
                        Win a Free Toffee Live Coupon
                      </div>
                      <div className="text-xs text-[#1A1A2E]/50">
                        Top 100 players get rewarded
                      </div>
                    </div>
                    <Gift className="w-6 h-6 text-[#1E90FF] flex-shrink-0" />
                  </button>
                );
              }

              /* ── Standard tiles ── */
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.route)}
                  style={tileStyle}
                  className="
                    cursor-pointer
                    bg-white/95 border-2 border-[#1E90FF] rounded-2xl
                    transition-all duration-150
                    hover:bg-blue-50/60
                    hover:shadow-[0_4px_20px_rgba(30,144,255,0.2)]
                    active:scale-[0.97]

                    /* MOBILE: icon top-left, text below — full width, no truncation */
                    flex items-center gap-1.5 px-3 py-3

                    /* DESKTOP: revert to original horizontal row layout */
                    flex-row sm:items-center sm:gap-3 sm:min-h-[80px] sm:py-0
                  "
                >
                  {/* Icon pill */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#1E90FF]/10 border border-[#1E90FF]/30">
                    <action.icon
                      className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E90FF]"
                      strokeWidth={2}
                    />
                  </div>

                  {/* Text block — no truncate ever */}
                  <div className="flex-1 text-left w-full">
                    <div
                      className="
                      font-bold text-[#1A1A2E] tracking-wide uppercase leading-tight
                      text-[10px] sm:text-sm
                    "
                    >
                      {action.label}
                    </div>
                    <div
                      className="
                      text-[#1A1A2E]/50 font-normal leading-tight mt-0.5
                      text-[9px] sm:text-[11px]
                    "
                    >
                      {action.subtitle}
                    </div>
                  </div>

                  {/* Chevron: desktop only */}
                  <ChevronRight className="hidden sm:block w-4 h-4 text-[#1A1A2E]/25 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center text-[#1A1A2E]/30 text-[9px] tracking-wider py-2 flex-shrink-0">
          RENATA ONCOLOGY · FIFA WORLD CUP FESTIVAL 2026
        </div>
      </div>
    </>
  );
}
