import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Flame, TrendingUp, Target, Star, Play } from "lucide-react";
import PremiumBackground from "../PremiumBackground";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://backend.cancercareworldcup.com/api";

// Derive backend origin to fix relative video URLs (e.g. /storage/highlights/...)
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

interface Highlight {
  id: number;
  title: string;
  source_type: "youtube" | "upload";
  youtube_id: string | null;
  embed_url: string | null;
  thumbnail: string | null;
  video_url: string | null;
  type: string;
  team: string | null;
  match_label: string | null;
  upload_time: string;
}

const filters = [
  { id: "all", label: "All", icon: Flame },
  { id: "goal", label: "Goals", icon: Target },
  { id: "save", label: "Saves", icon: Star },
  { id: "skill", label: "Skills", icon: TrendingUp },
];

export default function HighlightsScreen() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setPlayingId(null);
    const params = new URLSearchParams();
    if (selectedFilter !== "all") params.set("type", selectedFilter);

    fetch(`${API_BASE}/highlights?${params}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => setHighlights(data.data ?? []))
      .catch(() => setHighlights([]))
      .finally(() => setLoading(false));
  }, [selectedFilter]);

  return (
    <div className="min-h-screen bg-[#0A0E1A] relative">
      {/* Background — matches HomeDashboard */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A] via-[#10172A] to-[#0A0E1A]" />
      </div>
      <div className="opacity-[0.04] fixed inset-0 pointer-events-none z-0">
        <PremiumBackground />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0E1A]/80 backdrop-blur-md border-b border-white/[0.07]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#FFD700] rounded-full" />
            <h1 className="text-sm font-black text-white tracking-widest uppercase">
              Highlights
            </h1>
            <div className="w-1 h-4 bg-[#FFD700] rounded-full" />
          </div>

          <div className="w-10" />
        </div>

        {/* Filter Chips */}
        <div className="px-4 sm:px-6 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max sm:justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-150 active:scale-95 ${
                  selectedFilter === filter.id
                    ? "bg-[#FFD700] text-[#0A0E1A]"
                    : "bg-white/[0.06] border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <filter.icon className="w-3 h-3" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-3 sm:px-4 lg:px-6 py-4 pb-10">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 sm:gap-x-3 gap-y-4 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-video rounded-2xl bg-white/[0.06] mb-2" />
                <div className="h-2.5 bg-white/[0.06] rounded mb-1.5 w-full" />
                <div className="h-2.5 bg-white/[0.06] rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 sm:gap-x-3 lg:gap-x-4 gap-y-4 sm:gap-y-5 max-w-7xl mx-auto">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="cursor-pointer">
                {/* Thumbnail / Player */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0D1526] mb-2">
                  {playingId === highlight.id ? (
                    highlight.source_type === "upload" ? (
                      // HTML5 video player for uploaded files
                      <video
                        src={
                          highlight.video_url?.startsWith("http")
                            ? highlight.video_url
                            : `${BACKEND_ORIGIN}${highlight.video_url}`
                        }
                        controls
                        autoPlay
                        className="absolute inset-0 w-full h-full"
                      />
                    ) : (
                      // Embedded YouTube player
                      <iframe
                        src={`${highlight.embed_url}&autoplay=1`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={highlight.title}
                      />
                    )
                  ) : (
                    // Thumbnail with play button overlay
                    <>
                      {highlight.thumbnail ? (
                        <img
                          src={highlight.thumbnail}
                          alt={highlight.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            if (highlight.youtube_id) {
                              (e.currentTarget as HTMLImageElement).src =
                                `https://img.youtube.com/vi/${highlight.youtube_id}/hqdefault.jpg`;
                            }
                          }}
                        />
                      ) : highlight.source_type === "upload" && highlight.video_url ? (
                        // Show first frame of uploaded video as thumbnail
                        <video
                          src={
                            highlight.video_url.startsWith("http")
                              ? highlight.video_url
                              : `${BACKEND_ORIGIN}${highlight.video_url}`
                          }
                          preload="metadata"
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1526] to-[#10172A] flex items-center justify-center">
                          <Play className="w-8 h-8 text-white/10" fill="currentColor" />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/45 transition-colors"
                        onClick={() => setPlayingId(highlight.id)}
                      >
                        <div className="w-11 h-11 sm:w-[52px] sm:h-[52px] bg-[#1E90FF]/90 hover:bg-[#1E90FF] rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(30,144,255,0.5)] transition-all">
                          <Play
                            className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#1E90FF]/30 to-[#667eea]/30 border border-[#1E90FF]/20 flex items-center justify-center">
                      <span className="text-xs">⚽</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-xs sm:text-sm font-semibold leading-tight line-clamp-2 mb-1">
                      {highlight.title}
                    </h3>
                    {highlight.match_label && (
                      <p className="text-white/40 text-[10px] sm:text-xs mb-0.5">
                        {highlight.match_label}
                      </p>
                    )}
                    <p className="text-white/40 text-[10px] sm:text-xs">
                      {highlight.upload_time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && highlights.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="text-5xl opacity-30">🎬</div>
            <p className="text-white/30 text-sm tracking-wide">
              No highlights yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
