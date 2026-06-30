import RenataOnco from "@/imports/RenataOnco-100kb.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Home,
  PlayCircle,
  Trophy,
  Camera,
  User,
  Zap,
  TrendingUp,
  Flame,
  CalendarDays,
  Gamepad2,
  LogOut,
  BadgeHelp,
} from "lucide-react";
import { toast } from "sonner";
import PremiumBackground from "../PremiumBackground";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { logoutDoctor } from "@/app/lib/auth";

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleLogout() {
    await logoutDoctor();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  }

  const quickActions = [
    { icon: PlayCircle, label: "LIVE", route: "/live-dashboard" },
    { icon: Flame, label: "HIGHLIGHTS", route: "/highlights" },
    { icon: BadgeHelp, label: "TRIVIA QUIZ", route: "/quiz" },
    { icon: Camera, label: "PHOTOBOOTH", route: "/photobooth", locked: false },
    { icon: Gamepad2, label: "MINI GAME", route: "/game" },
    {
      icon: TrendingUp,
      label: "LEADERBOARD",
      route: "/leaderboard",
    },
    { icon: CalendarDays, label: "FIXTURE", route: "/fixture" },
  ];

  return (
    <div className="min-h-screen  pb-24 relative overflow-hidden">
      <PremiumBackground />

      {/* Premium Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 flex justify-center items-start">
        {/* Spacer to balance logout button */}
        <div className="w-11 flex-shrink-0" />
        {/* Company Logo - Large */}
        <div className="flex-1 flex justify-center">
          <div className="w-60 h-60  flex items-center justify-center">
            <ImageWithFallback
              src={RenataOnco}
              alt="Rolac Logo"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>
        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/80 border border-black/10 text-red-500 hover:bg-red-50 active:scale-95 transition-all shadow flex-shrink-0"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#1A1A2E] font-bold text-sm sm:text-base flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700]" />
            Quick Actions
          </h3>
          <div className="w-2 h-2 bg-[#FFD700] rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                if (action.locked) {
                  alert("Coming Soon!");
                  return;
                }
                navigate(action.route);
              }}
              className="bg-white/95 border-2 border-[#CC0000] rounded-2xl p-3 sm:p-5 flex items-center gap-2 sm:gap-4 min-h-[72px] sm:min-h-[90px] active:scale-95 transition-transform shadow-md overflow-hidden"
            >
              <div className="w-9 h-9 sm:w-14 sm:h-14 bg-gray-100 border border-[#CC0000]/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <action.icon
                  className="w-6 h-6 sm:w-9 sm:h-9 text-[#CC0000]"
                  strokeWidth={2}
                />
              </div>
              <span className="text-gray-700 text-[11px] sm:text-base font-black tracking-wide leading-tight text-left break-words min-w-0">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Community Feed */}

      {/* Premium Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#F7F5F0] via-[#F7F5F0]/95 to-transparent" />
          <div className="relative border-t border-black/15">
            <div className="flex items-center justify-around py-3 sm:py-4 px-2 sm:px-6 max-w-7xl mx-auto">
              {[
                { icon: Home, label: "Home", route: "/home", active: true },
                {
                  icon: PlayCircle,
                  label: "Live",
                  route: "/live",
                  active: false,
                },
                { icon: Trophy, label: "Quiz", route: "/quiz", active: false },
                { icon: Zap, label: "Game", route: "/game", active: false },
                {
                  icon: User,
                  label: "Profile",
                  route: "/leaderboard",
                  active: false,
                },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.route)}
                  className="flex flex-col items-center gap-1 relative min-w-[44px] min-h-[44px] justify-center"
                >
                  {item.active && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-1 bg-gradient-to-r from-[#1E90FF] to-[#667eea] rounded-full" />
                  )}
                  <div
                    className={`p-1.5 sm:p-2 rounded-xl ${item.active ? "bg-gradient-to-br from-[#1E90FF]/20 to-[#667eea]/20" : ""}`}
                  >
                    <item.icon
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${item.active ? "text-[#1E90FF]" : "text-[#1A1A2E]/60"}`}
                    />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs ${item.active ? "text-[#1E90FF] font-bold" : "text-[#1A1A2E]/60"}`}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
