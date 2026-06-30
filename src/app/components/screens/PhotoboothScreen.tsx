import image_Asset_16_6 from "@/imports/Asset_1.png";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  getToken,
  API_BASE as BACKEND_BASE,
  API_BASE_NOAPI as BACKEND_BASE_NOAPI } from "@/app/lib/auth";
import {
  ArrowLeft,
  Camera,
  Download,
  Share2,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Upload,
  X,
  ChevronRight,
  Gamepad2,
  HelpCircle,
  Home,
  Images,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
console.log("API_BASE:", BACKEND_BASE, "BACKEND_BASE_NOAPI:", BACKEND_BASE_NOAPI);
const API_BASE =
  (import.meta as any).env?.VITE_API_BASEa ||
  "https://photobooth.cancercareworldcup.coma";

const JERSEY_INDEX: Record<string, number> = {
  argentina: 1,
  brazil: 2,
  portugal: 3,
  france: 4,
  spain: 5,
  england: 6,
  germany: 7,
  netherlands: 8,
  belgium: 9,
  japan: 10,
};

const jerseys = [
  { id: "argentina", name: "Argentina", iso: "ar", flag: "🇦🇷" },
  { id: "brazil", name: "Brazil", iso: "br", flag: "🇧🇷" },
  { id: "portugal", name: "Portugal", iso: "pt", flag: "🇵🇹" },
  { id: "france", name: "France", iso: "fr", flag: "🇫🇷" },
  { id: "spain", name: "Spain", iso: "es", flag: "🇪🇸" },
  { id: "england", name: "England", iso: "gb-eng", flag: "🏴" },
  { id: "germany", name: "Germany", iso: "de", flag: "🇩🇪" },
  { id: "netherlands", name: "Netherlands", iso: "nl", flag: "🇳🇱" },
  { id: "belgium", name: "Belgium", iso: "be", flag: "🇧🇪" },
  { id: "japan", name: "Japan", iso: "jp", flag: "🇯🇵" },
];

function FlagImg({
  iso,
  name,
  className,
}: {
  iso: string;
  name: string;
  className?: string;
}) {
  return (
    <img
      src={`https://flagcdn.com/h40/${iso}.png`}
      srcSet={`https://flagcdn.com/h80/${iso}.png 2x`}
      alt={`${name} flag`}
      loading="lazy"
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function StepIndicator({ current, rightSlot }: { current: 2 | 3; rightSlot?: React.ReactNode }) {
  const labels = ["Choose jersey", "Take photo", "Preview"];
  return (
    <div className="px-4 sm:px-6 pt-3 pb-2 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((n) => {
            const done = n < current;
            const active = n === current;
            return (
              <div key={n} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                    done
                      ? "bg-[#1E90FF] text-white"
                      : active
                        ? "bg-[#1E90FF] text-white ring-4 ring-[#1E90FF]/20"
                        : "bg-black/10 text-[#1A1A2E]/40"
                  }`}
                >
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : n}
                </div>
                {n < 3 && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 rounded transition-all duration-300 ${done ? "bg-[#1E90FF]" : "bg-black/10"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
        {rightSlot && <div className="flex-shrink-0 ml-2">{rightSlot}</div>}
      </div>
      <p className="text-[11px] text-[#1A1A2E]/40 font-medium">
        Step {current} of 3 — {labels[current - 1]}
      </p>
    </div>
  );
}

type GalleryItem = {
  id: number;
  jersey: string;
  resultUrl: string;
  createdAt: string;
};

/** Prefix relative paths from Laravel Storage::url() with the backend base URL. */
const toAbsUrl = (url: string): string =>
  url.startsWith("/") ? `${BACKEND_BASE_NOAPI}${url}` : url;

export default function PhotoboothScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"capture" | "preview" | "result">("capture");
  const [showJerseyModal, setShowJerseyModal] = useState(true);
  const [selectedJersey, setSelectedJersey] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queue modal — shown when AI generation fails instead of an inline error
  const [showQueueModal, setShowQueueModal] = useState(false);

  // True once the user has actively tapped a flag (default selection doesn't count)
  const [hasPickedJersey, setHasPickedJersey] = useState(false);

  // Result-ready popup — shown when admin has uploaded the processed jersey image
  const [readyResult, setReadyResult] = useState<{
    id: number;
    jersey: string;
    resultUrl: string;
  } | null>(null);

  // Gallery of all AI-generated jerseys for this user
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPreview, setGalleryPreview] = useState<GalleryItem | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedTeam = jerseys.find((j) => j.id === selectedJersey) ?? jerseys[0];

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
    } catch {
      setCameraReady(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (step === "capture") startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [step, startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // On mount: populate gallery + surface result-ready popup
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${BACKEND_BASE}/photobooth/generations`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status !== "success") return;
        const all: any[] = data.data;

        // Populate gallery with all done results
        const done = all.filter((g) => g.status === "done" && g.result_url);
        setGalleryItems(
          done.map((g) => ({
            id: g.id,
            jersey: g.jersey,
            resultUrl: toAbsUrl(g.result_url),
            createdAt: g.created_at,
          }))
        );

        // Surface popup for the first unseen done result
        const seen: number[] = JSON.parse(
          localStorage.getItem("photobooth_seen_result_ids") || "[]"
        );
        const fresh = done.find((g) => !seen.includes(g.id));
        if (fresh) {
          setReadyResult({
            id: fresh.id,
            jersey: fresh.jersey,
            resultUrl: toAbsUrl(fresh.result_url),
          });
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissReadyResult = () => {
    if (!readyResult) return;
    const seen: number[] = JSON.parse(
      localStorage.getItem("photobooth_seen_result_ids") || "[]"
    );
    seen.push(readyResult.id);
    localStorage.setItem("photobooth_seen_result_ids", JSON.stringify(seen));
    setReadyResult(null);
  };

  const downloadReadyResult = () => {
    if (!readyResult) return;
    const a = document.createElement("a");
    a.href = readyResult.resultUrl;
    a.download = `worldcup_${readyResult.jersey}_jersey.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const shareReadyResult = async () => {
    if (!readyResult) return;
    try {
      const blob = await (await fetch(readyResult.resultUrl)).blob();
      const file = new File([blob], "worldcup.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My World Cup Look!" });
        return;
      }
    } catch {}
    downloadReadyResult();
  };

  const generate = useCallback(
    async (blob: Blob): Promise<string | null> => {
      try {
        const form = new FormData();
        form.append("image", blob, "person.jpg");
        form.append("index", String(JERSEY_INDEX[selectedJersey] ?? 1));
        form.append("team", selectedJersey);

        const res = await fetch(`${API_BASE}/generate`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || `Request failed (${res.status}).`);

        const jobId: string = data.job_id;
        if (!jobId) throw new Error("No job ID returned from server.");

        const POLL_INTERVAL = 2000;
        const deadline = Date.now() + 120_000;

        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL));
          const statusRes = await fetch(`${API_BASE}/status/${jobId}`);
          const statusData = await statusRes.json();
          if (statusData.status === "done") {
            return statusData.image_base64 || `${API_BASE}${statusData.result_url}`;
          }
          if (statusData.status === "error")
            throw new Error(statusData.error || "Generation failed.");
        }
        throw new Error("Generation timed out. Please try again.");
      } catch {
        // Show queue modal and silently save to backend for later retry
        setShowQueueModal(true);
        (async () => {
          try {
            const form = new FormData();
            form.append('photo', blob, 'person.jpg');
            form.append('jersey', selectedJersey);
            form.append('jersey_index', String(JERSEY_INDEX[selectedJersey] ?? 1));
            await fetch(`${BACKEND_BASE}/photobooth/generations`, {
              method: 'POST',
              headers: { Accept: 'application/json', Authorization: `Bearer ${getToken()}` },
              body: form,
            });
          } catch { /* silent */ }
        })();
        return null;
      }
    },
    [selectedJersey],
  );

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraReady || !video.videoWidth) {
      fileInputRef.current?.click();
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(blob));
        setCapturedBlob(blob);
        setStep("preview");
      },
      "image/jpeg",
      0.95,
    );
  }, [cameraReady, previewUrl]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setCapturedBlob(file);
      setStep("preview");
    }
    e.target.value = "";
  };

  const handleJerseySelect = (id: string) => {
    setSelectedJersey(id);
    setHasPickedJersey(true);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = `worldcup_${selectedJersey}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleShare = async () => {
    if (!resultImage) return;
    try {
      const blob = await (await fetch(resultImage)).blob();
      const file = new File([blob], "worldcup.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My World Cup Look!" });
        return;
      }
    } catch {}
    handleDownload();
  };

  const reset = () => {
    setResultImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCapturedBlob(null);
    setStep("capture");
    setShowJerseyModal(true);
  };


  return (
    <>
      {/* AI animation styles */}
      <style>{`
        @keyframes aiShimmer {
          0% { transform: translateX(-130%) skewX(-20deg); }
          100% { transform: translateX(230%) skewX(-20deg); }
        }
        @keyframes aiGlowPulse {
          0%, 100% { box-shadow: 0 4px 18px rgba(30,144,255,0.45), 0 1px 0 rgba(255,255,255,0.15) inset; }
          50% { box-shadow: 0 6px 36px rgba(30,144,255,0.75), 0 0 0 5px rgba(30,144,255,0.12), 0 1px 0 rgba(255,255,255,0.15) inset; }
        }
        @keyframes sparkFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(8deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes aiOverlayIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(8px); }
        }
        @keyframes aiIconPop {
          0% { transform: scale(0.6) rotate(-10deg); opacity: 0; }
          70% { transform: scale(1.08) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .ai-overlay { animation: aiOverlayIn 0.35s ease-out forwards; }
        .ai-overlay-icon { animation: aiIconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
        .ai-primary-btn {
          animation: aiGlowPulse 2.6s ease-in-out infinite;
          background: linear-gradient(135deg, #2196FF 0%, #1E90FF 40%, #0070E0 100%);
          position: relative;
          overflow: hidden;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .ai-primary-btn:active { transform: scale(0.97); opacity: 0.9; }
        .ai-primary-btn::before {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 45%;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
          transform: translateX(-130%) skewX(-20deg);
          animation: aiShimmer 3.6s ease-in-out infinite;
          pointer-events: none;
        }
        .ai-spark-icon {
          animation: sparkFloat 2s ease-in-out infinite;
          display: inline-flex;
        }
        .ai-secondary-btn {
          transition: all 0.18s ease;
          background: rgba(255,255,255,0.55);
          border: 1.5px solid rgba(26,26,46,0.10);
          backdrop-filter: blur(6px);
        }
        .ai-secondary-btn:active { transform: scale(0.97); background: rgba(255,255,255,0.7); }
        .ai-ghost-btn {
          transition: all 0.18s ease;
          background: transparent;
          border: 1.5px solid rgba(30,144,255,0.35);
          color: #1E90FF;
        }
        .ai-ghost-btn:active { transform: scale(0.97); background: rgba(30,144,255,0.06); }
        .step-animate { animation: fadeSlideUp 0.3s ease-out; }
      `}</style>

      <div
        className="flex flex-col overflow-hidden bg-transparent"
        style={{ height: "100dvh" }}
      >
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/60 backdrop-blur-md border-b border-black/8 z-10">
          <button
            onClick={() => navigate("/home")}
            className="text-[#1A1A2E] w-11 h-11 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
            <ImageWithFallback
              src={image_Asset_16_6}
              alt="Rolac Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-11 h-11 flex items-center justify-center">
            {galleryItems.length > 0 ? (
              <button
                onClick={() => setShowGallery(true)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
                aria-label="My Jerseys"
              >
                <Images className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E90FF]" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#1E90FF] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {galleryItems.length}
                </span>
              </button>
            ) : (
              <Sparkles
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E90FF]"
                style={{ animation: "sparkFloat 2.5s ease-in-out infinite" }}
              />
            )}
          </div>
        </header>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFile}
          className="hidden"
        />

        {/* ── CAPTURE STEP ── */}
        {step === "capture" && (
          <div className="flex-1 min-h-0 flex flex-col step-animate">
            {/* Step indicator + jersey pill in one row */}
            <div className="flex-shrink-0">
              <StepIndicator
                current={2}
                rightSlot={
                  <button
                    onClick={() => setShowJerseyModal(true)}
                    className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-black/10 rounded-full pl-1.5 pr-2.5 py-1 shadow-sm hover:bg-white transition-all active:scale-[0.97]"
                  >
                    <FlagImg
                      iso={selectedTeam.iso}
                      name={selectedTeam.name}
                      className="h-5 w-auto rounded-sm object-contain"
                    />
                    <span className="text-[11px] font-semibold text-[#1A1A2E] hidden xs:inline sm:inline">
                      {selectedTeam.name}
                    </span>
                    <span className="text-[10px] text-[#1E90FF] font-bold tracking-wide">
                      CHANGE
                    </span>
                    <ChevronRight className="w-3 h-3 text-[#1E90FF]" />
                  </button>
                }
              />
            </div>

            {/* Camera — fills remaining space */}
            <div className="flex-1 min-h-0 px-4 sm:px-6 max-w-2xl mx-auto w-full">
              <div className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${cameraReady ? "opacity-100" : "opacity-0"}`}
                  style={{ transform: "scaleX(-1)" }}
                />
                <div className="absolute inset-0 border-2 border-white/8 rounded-2xl sm:rounded-3xl pointer-events-none" />

                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white/50" />
                      </div>
                      <p className="text-white/70 text-sm font-medium">
                        Starting camera…
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        Or upload a photo below
                      </p>
                    </div>
                  </div>
                )}

                {/* Face oval guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-36 h-48 sm:w-44 sm:h-56 border-2 border-[#1E90FF]/50 rounded-full shadow-[0_0_20px_rgba(30,144,255,0.2)]" />
                </div>

                {/* Corner brackets */}
                {(["tl", "tr", "bl", "br"] as const).map((pos) => (
                  <div
                    key={pos}
                    className={`absolute w-7 h-7 border-[#1E90FF] pointer-events-none ${
                      pos === "tl"
                        ? "top-3 left-3 border-t-[3px] border-l-[3px] rounded-tl-lg"
                        : pos === "tr"
                          ? "top-3 right-3 border-t-[3px] border-r-[3px] rounded-tr-lg"
                          : pos === "bl"
                            ? "bottom-3 left-3 border-b-[3px] border-l-[3px] rounded-bl-lg"
                            : "bottom-3 right-3 border-b-[3px] border-r-[3px] rounded-br-lg"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex-shrink-0 flex items-center justify-center gap-4 px-4 sm:px-6 pt-3 pb-5 max-w-2xl mx-auto w-full space-y-2.5">
              {/* Primary: Capture */}
              <button
                onClick={handleCapture}
                className="ai-primary-btn w-full py-4 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2.5 min-h-[54px]"
              >
                <Camera className="w-5 h-5 relative z-10 flex-shrink-0" />
                <span className="relative z-10">Capture Photo</span>
              </button>

              {/* Secondary: Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="ai-primary-btn w-full py-4 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2.5 min-h-[54px]"
              >
                <Upload className="w-5 h-5 relative z-10 flex-shrink-0" />
                <span className="relative z-10">Upload photo instead</span>
              </button>
            </div>
          </div>
        )}

        {/* ── PREVIEW STEP ── */}
        {step === "preview" && (
          <div className="flex-1 min-h-0 flex flex-col step-animate">
            {/* Step indicator */}
            <div className="flex-shrink-0">
              <StepIndicator current={3} />
            </div>

            {/* Preview image — fills remaining space */}
            <div className="flex-1 min-h-0 px-4 sm:px-6 pt-1 max-w-2xl mx-auto w-full">
              <div className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-900 shadow-xl">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Your photo"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Jersey badge */}
                <div className="absolute top-3 left-3 bg-black/55 backdrop-blur-md rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg">
                  <FlagImg
                    iso={selectedTeam.iso}
                    name={selectedTeam.name}
                    className="h-4 w-auto rounded-sm object-contain"
                  />
                  <span className="text-white text-xs font-semibold">
                    {selectedTeam.name}
                  </span>
                </div>

                {/* Preview label */}
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="text-white/90 text-[10px] font-medium tracking-wide">
                    PREVIEW
                  </span>
                </div>

                {/* Footballer overlay — shown for at least 10 s while AI generates */}
                {isSubmitting && (
                  <div className="absolute inset-0 flex items-end justify-center bg-black/45 backdrop-blur-md overflow-hidden">
                    <img
                      src="/Footballer.svg"
                      alt="Generating your jersey…"
                      className="h-full w-auto object-contain object-bottom"
                      style={{ animation: "fadeSlideUp 0.4s ease-out" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex-shrink-0 px-4 sm:px-6 pt-3 pb-5 max-w-2xl mx-auto w-full space-y-2.5">
              {/* Primary: Generate with AI */}
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  if (!capturedBlob || isSubmitting) return;
                  setIsSubmitting(true);
                  const blob = capturedBlob;
                  // Start the AI call and the 10-second minimum timer together
                  const minWait = new Promise<void>((r) =>
                    setTimeout(r, 10000),
                  );
                  const url = await generate(blob);
                  if (url) {
                    // Save to backend while the overlay is still showing.
                    // Download the AI image blob so it goes into our own permanent storage
                    // (AI service URLs expire; a file upload does not).
                    const saveToDb = async (): Promise<GalleryItem | null> => {
                      try {
                        let resultBlob: Blob | null = null;
                        try {
                          resultBlob = await (await fetch(url)).blob();
                        } catch {
                          /* CORS / network — fall through to URL fallback */
                        }

                        const form = new FormData();
                        form.append("photo", blob, "person.jpg");
                        form.append("jersey", selectedJersey);
                        form.append(
                          "jersey_index",
                          String(JERSEY_INDEX[selectedJersey] ?? 1),
                        );
                        if (resultBlob) {
                          form.append("result_image", resultBlob, "result.jpg");
                        } else if (!url.startsWith("data:")) {
                          form.append("result_url", url);
                        }

                        const res = await fetch(
                          `${BACKEND_BASE}/photobooth/generations`,
                          {
                            method: "POST",
                            headers: {
                              Accept: "application/json",
                              Authorization: `Bearer ${getToken()}`,
                            },
                            body: form,
                          },
                        );
                        const data = await res.json();
                        if (!res.ok) return null;
                        const permanentUrl: string | null = data.result_url
                          ? toAbsUrl(data.result_url)
                          : null;
                        if (!permanentUrl) return null;
                        return {
                          id: data.id,
                          jersey: selectedJersey,
                          resultUrl: permanentUrl,
                          createdAt: new Date().toISOString(),
                        };
                      } catch {
                        return null;
                      }
                    };
                    // Wait for both the 10 s minimum and the DB save to finish
                    const [, saved] = await Promise.all([minWait, saveToDb()]);
                    if (saved) setGalleryItems((prev) => [saved, ...prev]);
                    setResultImage(url);
                    setIsSubmitting(false);
                    setStep("result");
                  } else {
                    // Failure: queue modal already shown by generate(); stop overlay immediately
                    setIsSubmitting(false);
                  }
                }}
                className="ai-primary-btn w-full py-4 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2.5 min-h-[54px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="ai-spark-icon relative z-10">
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className="relative z-10">
                  {isSubmitting ? "Preparing…" : "Generate with AI"}
                </span>
              </button>

              {/* Secondary row */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setStep("capture")}
                  className="ai-secondary-btn py-3.5 rounded-2xl text-[#1A1A2E] font-semibold text-sm flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <RefreshCw className="w-4 h-4 text-[#1A1A2E]/60" />
                  Retake
                </button>
                <button
                  onClick={() => setShowJerseyModal(true)}
                  className="ai-secondary-btn py-3.5 rounded-2xl text-[#1A1A2E] font-semibold text-sm flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <ChevronRight className="w-4 h-4 text-[#1A1A2E]/60" />
                  Change jersey
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT STEP ── */}
        {step === "result" && (
          <div className="flex-1 min-h-0 flex flex-col step-animate">
            {/* Result image */}
            <div className="flex-1 min-h-0 px-4 sm:px-6 pt-4 max-w-2xl mx-auto w-full">
              <div
                className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #75AADB, #1E90FF)",
                }}
              >
                {resultImage && (
                  <img
                    src={resultImage}
                    alt="Player in jersey"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent p-5 text-center">
                  <p className="text-lg sm:text-xl font-bold text-white">
                    Your World Cup Look!
                  </p>
                  <p className="text-xs text-white/75 mt-0.5">
                    {selectedTeam.name} Jersey
                  </p>
                </div>
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="text-white text-[10px] font-medium tracking-wide">
                    AI ENHANCED
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex-shrink-0 px-4 sm:px-6 pt-3 pb-5 max-w-2xl mx-auto w-full space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleDownload}
                  className="ai-primary-btn py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 min-h-[50px]"
                >
                  <Download className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Download</span>
                </button>
                <button
                  onClick={handleShare}
                  className="ai-primary-btn py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 min-h-[50px]"
                >
                  <Share2 className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Share</span>
                </button>
              </div>
              <button
                onClick={reset}
                className="ai-secondary-btn w-full py-3.5 rounded-2xl text-[#1A1A2E] font-semibold text-sm flex items-center justify-center gap-2 min-h-[48px]"
              >
                <RefreshCw className="w-4 h-4 text-[#1A1A2E]/60" />
                Take Another Photo
              </button>
            </div>
          </div>
        )}

        {/* ── JERSEY SELECTION MODAL ── */}
        {showJerseyModal && (
          <>
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40 transition-opacity" />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl max-h-[88vh] overflow-y-auto">
              <div className="px-4 sm:px-6 pt-3 pb-8">
                <div className="w-10 h-1 bg-black/10 rounded-full mx-auto mb-4" />

                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-[10px] text-[#1A1A2E]/35 font-bold uppercase tracking-widest mb-0.5">
                      Step 1 of 3
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-[#1A1A2E]">
                      Choose Your Jersey
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* Gallery button — only shown when the user has at least one done result */}
                    {galleryItems.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowGallery(true);
                        }}
                        className="relative flex items-center gap-1.5 bg-[#1E90FF]/10 hover:bg-[#1E90FF]/18 border border-[#1E90FF]/25 text-[#1E90FF] rounded-full pl-2.5 pr-3 py-1.5 transition-all active:scale-95"
                      >
                        <Images className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-[11px] font-bold leading-none">
                          My Jerseys
                        </span>
                        <span className="ml-0.5 min-w-[18px] h-[18px] bg-[#1E90FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {galleryItems.length}
                        </span>
                      </button>
                    )}
                    {/* Create Jersey — disabled until the user taps a flag */}
                    <button
                      disabled={!hasPickedJersey}
                      onClick={() => setShowJerseyModal(false)}
                      className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
                      style={
                        hasPickedJersey
                          ? {
                              background:
                                "linear-gradient(135deg, #2196FF 0%, #1E90FF 40%, #0070E0 100%)",
                              boxShadow: "0 3px 12px rgba(30,144,255,0.4)",
                              color: "white",
                            }
                          : {
                              background: "rgba(0,0,0,0.07)",
                              color: "rgba(26,26,46,0.3)",
                            }
                      }
                    >
                      <Camera className="w-3.5 h-3.5 flex-shrink-0" />
                      Create Jersey
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#1A1A2E]/40 mb-5">
                  Tap a flag to select your team, then press{" "}
                  <span className="font-semibold text-[#1E90FF]">
                    Create Jersey
                  </span>
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                  {jerseys.map((jersey) => {
                    const active = selectedJersey === jersey.id;
                    return (
                      <button
                        key={jersey.id}
                        onClick={() => handleJerseySelect(jersey.id)}
                        className={`relative flex flex-col items-center justify-center rounded-2xl p-2.5 sm:p-3 transition-all duration-200 min-h-[76px] sm:min-h-[88px] active:scale-95 ${
                          active
                            ? "border-2 border-[#1E90FF] shadow-[0_0_16px_rgba(30,144,255,0.25)]"
                            : "bg-black/4 border-2 border-transparent hover:border-black/10"
                        }`}
                        style={
                          active
                            ? {
                                background:
                                  "linear-gradient(135deg, rgba(30,144,255,0.12), rgba(30,144,255,0.06))",
                              }
                            : {}
                        }
                      >
                        <FlagImg
                          iso={jersey.iso}
                          name={jersey.name}
                          className="h-6 sm:h-7 w-auto rounded-sm shadow-sm mb-1.5 object-contain"
                        />
                        <span
                          className="text-2xl sm:text-3xl leading-none mb-1.5"
                          style={{ display: "none" }}
                        >
                          {jersey.flag}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs text-center leading-tight font-medium ${active ? "text-[#1E90FF]" : "text-[#1A1A2E]/70"}`}
                        >
                          {jersey.name}
                        </span>
                        {active && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1E90FF] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── GALLERY MODAL ── */}
        {showGallery && (
          <div
            className="fixed inset-0 z-[60] flex flex-col bg-white"
            style={{ animation: "fadeSlideUp 0.28s ease-out" }}
          >
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-black/8 bg-white/90 backdrop-blur-md">
              {galleryPreview ? (
                <button
                  onClick={() => setGalleryPreview(null)}
                  className="flex items-center gap-1.5 text-[#1A1A2E] font-semibold text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Gallery
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Images className="w-4 h-4 text-[#1E90FF]" />
                  <h3 className="font-bold text-[#1A1A2E] text-base">
                    My Jerseyss
                  </h3>
                  <span className="bg-[#1E90FF] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {galleryItems.length}
                  </span>
                </div>
              )}
              <button
                onClick={() => {
                  setShowGallery(false);
                  setGalleryPreview(null);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/7 text-[#1A1A2E]/55 hover:bg-black/12 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {!galleryPreview ? (
              /* ── Grid view ── */
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                  {galleryItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setGalleryPreview(item)}
                      className="flex flex-col rounded-2xl overflow-hidden bg-gray-100 shadow-sm active:scale-95 transition-transform text-left"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-gray-200">
                        <img
                          src={item.resultUrl}
                          alt={item.jersey}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="px-2.5 py-2">
                        <p className="text-[11px] font-semibold text-[#1A1A2E] capitalize leading-tight">
                          {item.jersey}
                        </p>
                      </div>
                      {console.log(item.resultUrl)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Preview view ── */
              <div className="flex-1 min-h-0 flex flex-col step-animate">
                {/* Image */}
                <div className="flex-1 min-h-0 px-4 sm:px-6 pt-4 max-w-2xl mx-auto w-full">
                  <div
                    className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                      background: "linear-gradient(135deg, #75AADB, #1E90FF)",
                    }}
                  >
                    <img
                      src={galleryPreview.resultUrl}
                      alt={`${galleryPreview.jersey} jersey`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent p-5 text-center">
                      <p className="text-lg sm:text-xl font-bold text-white">
                        Your World Cup Look!
                      </p>
                      <p className="text-xs text-white/75 mt-0.5 capitalize">
                        {galleryPreview.jersey} Jersey
                      </p>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <span className="text-white text-[10px] font-medium tracking-wide">
                        AI ENHANCED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex-shrink-0 px-4 sm:px-6 pt-3 pb-5 max-w-2xl mx-auto w-full space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = galleryPreview.resultUrl;
                        a.download = `worldcup_${galleryPreview.jersey}.jpg`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      }}
                      className="ai-primary-btn py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 min-h-[50px]"
                    >
                      <Download className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Download</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const blob = await (
                            await fetch(galleryPreview.resultUrl)
                          ).blob();
                          const file = new File([blob], "worldcup.jpg", {
                            type: "image/jpeg",
                          });
                          if (navigator.canShare?.({ files: [file] })) {
                            await navigator.share({
                              files: [file],
                              title: "My World Cup Look!",
                            });
                            return;
                          }
                        } catch {}
                        const a = document.createElement("a");
                        a.href = galleryPreview.resultUrl;
                        a.download = `worldcup_${galleryPreview.jersey}.jpg`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      }}
                      className="ai-primary-btn py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 min-h-[50px]"
                    >
                      <Share2 className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── QUEUE MODAL — shown when AI generation fails ── */}
        {showQueueModal && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowQueueModal(false)}
            />
            <div
              className="fixed inset-x-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm top-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl shadow-2xl p-6"
              style={{ animation: "fadeSlideUp 0.3s ease-out" }}
            >
              {/* Icon */}
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #2196FF, #0070E0)",
                }}
              >
                <Sparkles
                  className="w-7 h-7 text-white"
                  style={{ animation: "sparkFloat 2s ease-in-out infinite" }}
                />
              </div>

              <h3 className="text-center text-lg font-bold text-[#1A1A2E] mb-1">
                We're on it!
              </h3>
              <p className="text-center text-sm text-[#1A1A2E]/55 mb-6 leading-relaxed">
                Your AI jersey is being prepared in the background. Come back to
                this page later to see your result.
              </p>

              {/* Primary: Go Home */}
              <button
                onClick={() => {
                  setShowQueueModal(false);
                  navigate("/home");
                }}
                className="ai-primary-btn w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 min-h-[50px] mb-2.5"
              >
                <Home className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Go to Home</span>
              </button>

              {/* Secondary row: Mini Game + Quiz */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setShowQueueModal(false);
                    navigate("/game");
                  }}
                  className="ai-secondary-btn py-3 rounded-2xl text-[#1A1A2E] font-semibold text-sm flex items-center justify-center gap-1.5 min-h-[46px]"
                >
                  <Gamepad2 className="w-4 h-4 text-[#1A1A2E]/60" />
                  Mini Game
                </button>
                <button
                  onClick={() => {
                    setShowQueueModal(false);
                    navigate("/quiz");
                  }}
                  className="ai-secondary-btn py-3 rounded-2xl text-[#1A1A2E] font-semibold text-sm flex items-center justify-center gap-1.5 min-h-[46px]"
                >
                  <HelpCircle className="w-4 h-4 text-[#1A1A2E]/60" />
                  Try Quiz
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── RESULT-READY POPUP — shown when admin uploaded the jersey image ── */}
      {readyResult && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            onClick={dismissReadyResult}
          />
          <div
            className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm top-1/2 -translate-y-1/2 z-[60] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              animation: "fadeSlideUp 0.35s ease-out",
              maxHeight: "90dvh",
            }}
          >
            {/* Image */}
            <div
              className="relative flex-shrink-0 bg-gray-900"
              style={{ height: "300px" }}
            >
              <img
                src={readyResult.resultUrl}
                alt="Your AI jersey"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              {/* Badge */}
              <div className="absolute top-3 right-3 bg-[#1E90FF] text-white text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full">
                AI READY
              </div>
              {/* Title overlay */}
              <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                <p className="text-white font-bold text-lg leading-tight">
                  Your AI Jersey is Ready!
                </p>
                <p className="text-white/70 text-sm capitalize mt-0.5">
                  {readyResult.jersey} Jersey
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="p-5 space-y-2.5 flex-shrink-0">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={downloadReadyResult}
                  className="ai-primary-btn py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 min-h-[50px]"
                >
                  <Download className="w-4 h-4 relative z-10 flex-shrink-0" />
                  <span className="relative z-10">Download</span>
                </button>
                <button
                  onClick={shareReadyResult}
                  className="ai-primary-btn py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 min-h-[50px]"
                >
                  <Share2 className="w-4 h-4 relative z-10 flex-shrink-0" />
                  <span className="relative z-10">Share</span>
                </button>
              </div>
              <button
                onClick={dismissReadyResult}
                className="w-full py-2.5 text-[#1A1A2E]/40 text-sm font-medium hover:text-[#1A1A2E]/60 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
