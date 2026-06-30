import image_Asset_1_5 from "@/imports/Asset_1.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Flame, TrendingUp, Target, Star, Play } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

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
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-black/15 bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          <button
            onClick={() => navigate("/home")}
            className="text-[#1A1A2E] w-11 h-11 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
            <ImageWithFallback
              src={image_Asset_1_5}
              alt="Rolac Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-11" />
        </div>

        {/* Filter Chips */}
        <div className="px-3 sm:px-4 lg:px-6 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max sm:justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                  selectedFilter === filter.id
                    ? "bg-[#1E90FF] text-white"
                    : "bg-white/95 text-[#1A1A2E]/80 border border-black/10"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <filter.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {filter.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 sm:gap-x-3 gap-y-4 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-video rounded-lg bg-gray-200 mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-1.5 w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
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
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900 mb-2">
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
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white/30" fill="currentColor" />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                        onClick={() => setPlayingId(highlight.id)}
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <Play
                            className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1A2E] ml-0.5"
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
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#1E90FF] to-[#0066CC] flex items-center justify-center">
                      <span className="text-xs">⚽</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#1A1A2E] text-xs sm:text-sm font-medium leading-tight line-clamp-2 mb-1">
                      {highlight.title}
                    </h3>
                    {highlight.match_label && (
                      <p className="text-[#1A1A2E]/60 text-[10px] sm:text-xs mb-0.5">
                        {highlight.match_label}
                      </p>
                    )}
                    <p className="text-[#1A1A2E]/60 text-[10px] sm:text-xs">
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
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🎬</p>
            <p className="text-[#1A1A2E]/70">No highlights found</p>
          </div>
        )}
      </div>
    </div>
  );
}
