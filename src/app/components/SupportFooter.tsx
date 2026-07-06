import { Phone } from "lucide-react";

/**
 * Global support strip shown at the very bottom of every page.
 * Fixed to the viewport so it stays visible while scrolling.
 * Height is h-11 on mobile (allows the line to wrap to two rows) and
 * h-9 from sm up. Kept in sync with any per-screen fixed bottom
 * navigation (see HomeDashboard) and with the bottom padding in Root.
 */
export default function SupportFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-11 sm:h-9 select-none">
      {/* subtle top accent hairline */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CC0000]/60 to-transparent" />

      {/* frosted glass bar */}
      <div className="h-full bg-[#F7F5F0]/90 backdrop-blur-md border-t border-black/5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="h-full max-w-7xl mx-auto flex items-center justify-center gap-2 px-3 sm:px-4">
          {/* decorative support badge (desktop only, keeps mobile line short) */}
          <span className="hidden sm:flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-[#CC0000] to-[#8a0000] shadow-sm shrink-0">
            <Phone className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
          </span>

          <p className="min-w-0 text-[11px] sm:text-xs font-semibold tracking-wide text-[#1A1A2E]/85 text-center leading-tight">
            Renata World Cup Football Campaign <br /> Support Team-01606-590270
          </p>

          {/* developer credit */}
          <a
            href="https://xri.com.bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex shrink-0 items-center gap-1 text-[10px] sm:text-[11px] font-medium tracking-wide text-[#1A1A2E]/45 hover:text-[#CC0000] transition-colors"
          >
            <span className="text-[#1A1A2E]/30">|</span>
            Developed by XRI
          </a>
        </div>
      </div>
    </footer>
  );
}
