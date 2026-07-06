import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Copy, ExternalLink, Loader2, Tv, X } from "lucide-react";
import { toast } from "sonner";
import image_Asset_1_4 from "@/imports/Asset_1.png";
import { getLiveCoupon } from "../../lib/auth";

const REDIRECT_URL = "https://toffeelive.com/en";

export default function LiveStreamScreen() {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Fetch (or assign) coupon on mount
  useEffect(() => {
    getLiveCoupon()
      .then((result) => {
        if (result.status === 'success' && result.coupon_code) {
          setCouponCode(result.coupon_code);
          navigator.clipboard.writeText(result.coupon_code).then(() => {
            toast.success("Coupon code copied!");
          });
        } else {
          setCouponError(result.message ?? "You are not eligible for a coupon.");
        }
      })
      .catch((err: Error) => {
        setCouponError(err.message ?? "Could not load coupon code.");
      });
  }, []);

  // Auto-redirect after 30 seconds if user does nothing
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open(REDIRECT_URL, "_blank", "noopener,noreferrer");
      navigate("/home");
    }, 30000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleRedirect = () => {
    window.open(REDIRECT_URL, "_blank", "noopener,noreferrer");
    navigate("/home");
  };

  const handleClose = () => {
    navigate("/home");
  };

  const handleCopy = () => {
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode).then(() => {
      toast.success("Coupon code copied!");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/98 rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute cursor-pointer top-4 right-4 w-9 h-9 bg-black/8 hover:bg-black/15 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#0A1F44] to-[#1E3A6E] px-6 pt-8 pb-6 text-center">
          <img
            src={image_Asset_1_4}
            alt="Rolac Logo"
            className="h-14 w-auto object-contain mx-auto mb-4 drop-shadow-lg"
          />
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-bold tracking-widest uppercase">
              Live Now
            </span>
          </div>
          <h2 className="text-white text-2xl font-black mb-1">Watch Live</h2>
          <p className="text-white/70 text-sm">FIFA World Cup 2026</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Instructions */}
          <div className="bg-[#F0F7FF] rounded-2xl p-4 border border-[#1E90FF]/20">
            <h3 className="text-[#0A1F44] font-bold text-sm mb-3 flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#1E90FF]" />
              How to Watch
            </h3>
            <ol className="space-y-2">
              {[
                "Copy the coupon code below",
                'Click "Go to Toffee Live" to open the streaming platform',
                "Sign in or create a free account on Toffee Live",
                "Enter the coupon code to unlock free access",
                "Enjoy the match!",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-[#1E90FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[#1A1A2E]/80 text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Coupon Code */}
          <div>
            <p className="text-[#1A1A2E]/60 text-xs font-medium mb-2 text-center uppercase tracking-wider">
              Your Free Coupon Code
            </p>
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#0A1F44]/5 to-[#1E90FF]/10 border-2 border-dashed border-[#1E90FF]/40 rounded-2xl p-4">
              <div className="flex-1 text-center">
                {couponCode ? (
                  <span className="text-[#0A1F44] text-3xl font-black tracking-widest">
                    {couponCode}
                  </span>
                ) : couponError ? (
                  <span className="text-red-500 text-sm font-medium">
                    {couponError}
                  </span>
                ) : (
                  <Loader2 className="w-6 h-6 text-[#1E90FF] animate-spin mx-auto" />
                )}
              </div>
              <button
                onClick={handleCopy}
                disabled={!couponCode}
                className="flex-shrink-0 flex flex-col items-center gap-1 bg-[#1E90FF] hover:bg-[#0066CC] disabled:opacity-40 text-white px-4 py-3 rounded-xl transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span className="text-[10px] font-bold">COPY</span>
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleRedirect}
            type="button"
            className="w-full py-4 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#1E90FF]/30 active:scale-95 transition-transform text-base"
          >
            <ExternalLink className="w-5 h-5" />
            Go to Toffee Live
          </button>

          <p className="text-center text-[#1A1A2E]/40 text-xs">
            Closing this screen will redirect you to Toffee Live automatically
          </p>
        </div>
      </div>
    </div>
  );
}
