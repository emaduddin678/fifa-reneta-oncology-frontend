import RenataOnco from "@/imports/RenataOnco-100kb.png";
import bgMobile from "@/imports/Fifa_Worldcup_bg_mobile.png";
import bgDesktop from "@/imports/Fifa_Worldcup_bg_Desktop.png";
import bgMobile from "@/imports/Fifa_Worldcup_bg_mobile.png";
import bgDesktop from "@/imports/Fifa_Worldcup_bg_Desktop.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleEnter() {
    setExiting(true);
    setTimeout(() => navigate("/login"), 380);
  }

  const particles = [
    { left: "14%", delay: "0s", duration: "3.6s" },
    { left: "30%", delay: "0.9s", duration: "4.4s" },
    { left: "50%", delay: "1.8s", duration: "3.8s" },
    { left: "68%", delay: "0.5s", duration: "4.8s" },
    { left: "84%", delay: "1.3s", duration: "3.4s" },
  ];

  return (
    <div
      className="h-[100dvh] w-full relative overflow-hidden flex flex-col"
      style={{
        opacity: exiting ? 0 : visible ? 1 : 0,
        transform: exiting
          ? "scale(1.04)"
          : visible
            ? "scale(1)"
            : "scale(0.98)",
        transition: exiting
          ? "opacity 0.4s ease, transform 0.4s ease"
          : "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <style>{`
        @keyframes ctaPulse {
          0%   { box-shadow: 0 8px 32px rgba(107,53,168,0.5), 0 0 0 0 rgba(107,53,168,0.4); }
          70%  { box-shadow: 0 8px 32px rgba(107,53,168,0.5), 0 0 0 16px rgba(107,53,168,0); }
          100% { box-shadow: 0 8px 32px rgba(107,53,168,0.5), 0 0 0 0 rgba(107,53,168,0); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0); opacity: 0.5; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        .cta-pulse {
          animation: ctaPulse 2.5s ease-out infinite;
          animation-delay: 1200ms;
        }
        .particle {
          animation-name: floatUp;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }
      `}</style>

      {/* Background — pre-composited stadium/brushstroke/silhouette artwork */}
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

      {/* Floating particles */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle absolute top-1/3 w-1.5 h-1.5 rounded-full bg-white/50"
            style={{
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 gap-4">
        <div
          className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#6B35A8] uppercase bg-[#6B35A8]/10 border border-[#6B35A8]/30 rounded-full px-4 py-1.5"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease",
            transitionDelay: "200ms",
          }}
        >
          ⚽ Renata Oncology Presents
        </div>

        <div
          className="w-[210px] sm:w-[300px] lg:w-[340px]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? "scale(1) translateY(0)"
              : "scale(0.92) translateY(12px)",
            transition:
              "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: "350ms",
          }}
        >
          <ImageWithFallback
            src={RenataOnco}
            alt="Renata Oncology — FIFA World Cup Festival 2026"
            className="w-full h-auto object-contain drop-shadow-[0_2px_16px_rgba(107,53,168,0.35)]"
          />
        </div>

        <p
          className="text-sm sm:text-base text-[#6B35A8]/70 font-medium text-center max-w-[260px] sm:max-w-sm mx-auto"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease",
            transitionDelay: "750ms",
          }}
        >
          Experience the World Cup like never before
        </p>

        <button
          onClick={handleEnter}
          className="cta-pulse mt-2 flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-white/30 text-white font-bold text-sm sm:text-base tracking-wide transition-all duration-200 hover:scale-[1.04] hover:brightness-110 active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #7B4FCF 0%, #5B35AF 100%)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            transitionDelay: "950ms",
          }}
        >
          Enter Experience
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* XRI credit */}
      <div className="relative z-20 pb-4 text-center">
        <p className="text-[10px] text-[#6B35A8]/60 tracking-wide">
          Developed by{" "}
          <a
            href="https://xri.com.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6B35A8] font-semibold underline"
          >
            XR Interactive
          </a>
        </p>
      </div>
    </div>
  );
}
