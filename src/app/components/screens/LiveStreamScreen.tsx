import image_Asset_16_2 from '@/imports/Asset_1.png';
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, Radio, X } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import Hls from "hls.js";

// ─── Ad Configuration ────────────────────────────────────────────────────────
// • intervalMs  – delay between ads (ms). Default: 60 000 = 1 minute
// • durationMs  – how long each ad stays visible (ms). Default: 15 000 = 15 s
// • dismissible – show a close (✕) button so users can skip the ad early
// • ads         – list of banner ads to cycle through
//     src      : path relative to /public  (e.g. "/ads/my-banner.png")
//     alt      : accessible alt text
//     clickUrl : open this URL when the ad is clicked; leave "" to disable
const AD_CONFIG = {
  intervalMs: 60_000,
  durationMs: 15_000,
  dismissible: true,
  ads: [
    { src: "/ads/ads-banner-1.png", alt: "Ad 1", clickUrl: "" },
    { src: "/ads/ads-banner-2.png", alt: "Ad 2", clickUrl: "" },
    { src: "/ads/ads-banner-3.png", alt: "Ad 3", clickUrl: "" },
    { src: "/ads/ads-banner-4.png", alt: "Ad 4", clickUrl: "" },
    { src: "/ads/ads-banner-5.png", alt: "Ad 5", clickUrl: "" },
    { src: "/ads/ads-banner-6.png", alt: "Ad 6", clickUrl: "" },
    // { src: "/ads/ads-banner-7.png", alt: "Ad 7", clickUrl: "" },
    // { src: "/ads/ads-banner-8.png", alt: "Ad 8", clickUrl: "" },

  ],
};
// ─────────────────────────────────────────────────────────────────────────────

// ─── Channels ────────────────────────────────────────────────────────────────
const CHANNELS = [
  { name: "Channel 1", url: "https://iptvbd.live/iframetv/1080.m3u8" },
  { name: "Channel 2", url: "https://xrtv.site/live/mbtv/index.m3u8" },
  { name: "Channel 3", url: "https://iptvbd.live/moviebangla/1080.m3u8" },
];
// ─────────────────────────────────────────────────────────────────────────────


export default function LiveStreamScreen() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeChannel, setActiveChannel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Ad state
  const [adVisible, setAdVisible] = useState(false);
  const [adSlideIn, setAdSlideIn] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const adIndexRef = useRef(0);
  const adDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize HLS — re-runs whenever activeChannel changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = CHANNELS[activeChannel].url;

    setIsPlaying(false);
    setIsLoading(true);
    setHasError(false);

    // Tear down any existing instance
    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
        setIsLoading(false);
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setHasError(true);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari)
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
        setIsLoading(false);
      });
    } else {
      setHasError(true);
      setIsLoading(false);
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [activeChannel]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ── Ad system ──────────────────────────────────────────────────────────────
  const hideAd = useCallback(() => {
    setAdSlideIn(false);
    // wait for slide-out animation before unmounting
    setTimeout(() => setAdVisible(false), 400);
    if (adDismissTimerRef.current) {
      clearTimeout(adDismissTimerRef.current);
      adDismissTimerRef.current = null;
    }
  }, []);

  const showAd = useCallback(() => {
    if (AD_CONFIG.ads.length === 0) return;

    const nextIndex = (adIndexRef.current + 1) % AD_CONFIG.ads.length;
    adIndexRef.current = nextIndex;

    const ad = AD_CONFIG.ads[nextIndex];
    // Preload image – only show when fully loaded to prevent broken frames
    const img = new Image();
    img.src = ad.src;
    const present = () => {
      setAdIndex(nextIndex);
      setAdVisible(true);
      // Trigger slide-in on next frame so CSS transition fires
      requestAnimationFrame(() => requestAnimationFrame(() => setAdSlideIn(true)));
      // Auto-dismiss after durationMs
      adDismissTimerRef.current = setTimeout(hideAd, AD_CONFIG.durationMs);
    };
    if (img.complete) {
      present();
    } else {
      img.onload = present;
      // If the image fails to load, skip this ad silently
      img.onerror = () => {};
    }
  }, [hideAd]);

  // Fire first ad after intervalMs, then repeat
  useEffect(() => {
    const interval = setInterval(showAd, AD_CONFIG.intervalMs);
    return () => {
      clearInterval(interval);
      if (adDismissTimerRef.current) clearTimeout(adDismissTimerRef.current);
    };
  }, [showAd]);
  // ──────────────────────────────────────────────────────────────────────────

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    video.muted = val === 0;
    setVolume(val);
    setIsMuted(val === 0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={() => navigate('/home')}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          <ImageWithFallback
            src={image_Asset_16_2}
            alt="Rolac Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full">
          <Radio className="w-3 h-3 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Player Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
        <div
          ref={containerRef}
          className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video group"
          onMouseMove={resetControlsTimer}
          onMouseEnter={resetControlsTimer}
          onTouchStart={resetControlsTimer}
        >
          {/* Video */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            onClick={togglePlay}
          />

          {/* Loading overlay */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
              <span className="text-white/70 text-sm">Loading stream…</span>
            </div>
          )}

          {/* Error overlay */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4 px-4">
              <span className="text-red-400 text-lg font-semibold">Stream unavailable</span>
              <span className="text-white/50 text-sm text-center">This channel is down. Try switching to another one.</span>
              <div className="flex gap-2 flex-wrap justify-center">
                {CHANNELS.map((ch, i) =>
                  i !== activeChannel ? (
                    <button
                      key={i}
                      onClick={() => setActiveChannel(i)}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-full transition-colors"
                    >
                      Try {ch.name}
                    </button>
                  ) : null
                )}
              </div>
              <button
                onClick={() => navigate('/toffee-coupon')}
                className="mt-1 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Watch on Toffee Live →
              </button>
            </div>
          )}

          {/* ── Ad Banner ─────────────────────────────────────────────────── */}
          {adVisible && (() => {
            const ad = AD_CONFIG.ads[adIndex];
            const inner = (
              <img
                src={ad.src}
                alt={ad.alt}
                className="w-full block"
                draggable={false}
              />
            );
            return (
              <div
                className="absolute inset-x-0 z-20 pointer-events-auto"
                style={{
                  bottom: "52px",
                  transform: adSlideIn ? "translateY(0)" : "translateY(100%)",
                  opacity: adSlideIn ? 1 : 0,
                  transition: adSlideIn
                    ? "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out"
                    : "transform 0.45s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.3s ease-in",
                  willChange: "transform, opacity",
                }}
              >
                {/* Close button */}
                {AD_CONFIG.dismissible && (
                  <button
                    onClick={(e) => { e.stopPropagation(); hideAd(); }}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                    aria-label="Close ad"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {ad.clickUrl ? (
                  <a href={ad.clickUrl} target="_blank" rel="noopener noreferrer" className="block">
                    {inner}
                  </a>
                ) : inner}
              </div>
            );
          })()}

          {/* Controls overlay */}
          {!isLoading && !hasError && (
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex items-center gap-3">
                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  {isPlaying
                    ? <Pause className="w-4 h-4 fill-white" />
                    : <Play className="w-4 h-4 fill-white ml-0.5" />
                  }
                </button>

                {/* Volume */}
                <button
                  onClick={toggleMute}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white shrink-0"
                >
                  {isMuted || volume === 0
                    ? <VolumeX className="w-4 h-4" />
                    : <Volume2 className="w-4 h-4" />
                  }
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-white cursor-pointer"
                />

                <div className="flex-1" />

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  {isFullscreen
                    ? <Minimize className="w-4 h-4" />
                    : <Maximize className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Channel Switcher */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {CHANNELS.map((ch, i) => (
            <button
              key={i}
              onClick={() => setActiveChannel(i)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                i === activeChannel
                  ? "bg-white text-black border-white"
                  : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>

        <p className="text-white/40 text-xs">FIFA World Cup 2026 · Live Stream</p>
      </div>
    </div>
  );
}
