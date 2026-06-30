import image_Asset_1 from '@/imports/Asset_1.png'
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full overflow-hidden relative flex flex-col items-center justify-center px-6 text-center">
      {/* Large Logo Only */}
      <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center mb-16">
        <ImageWithFallback
          src={image_Asset_1}
          alt="Rolac Logo"
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </div>

      <button
        onClick={() => navigate("/login")}
        className="px-16 py-5 bg-gradient-to-r from-[#1E90FF] to-[#764ba2] text-white text-xl font-bold rounded-full shadow-lg"
      >
        <span className="flex items-center gap-3">
          Enter Experience
          <ChevronRight className="w-6 h-6" />
        </span>
      </button>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-black/70 text-sm tracking-wider">
          Developed by{" "}
          <span className="text-[#1E90FF] font-semibold"><a href="https://xri.com.bd" target="_blank" rel="noopener noreferrer">XR Interactive</a></span>
        </p>
      </div>
    </div>
  );
}
