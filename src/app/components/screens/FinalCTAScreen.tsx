import image_Asset_16_10 from '@/imports/Asset_1.png'
import { useNavigate } from "react-router";
import { Zap, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
export default function FinalCTAScreen() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen ">
      {/* Header with Logo */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 py-4 sm:py-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
          <ImageWithFallback
            src={image_Asset_16_10}
            alt="Rolac Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-[#1E90FF] rounded-full blur-[100px] sm:blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-[#1E90FF] rounded-full blur-[100px] sm:blur-[150px]" />
        </div>
        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div>
            <div className="mb-6 sm:mb-8">
              <div
                className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6"
              >
                ⚽
              </div>
            </div>
            <h1
              className="mb-6"
            >
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A2E] mb-3">
                Are You Ready?
              </span>
              <span className="block text-xl sm:text-2xl text-[#1A1A2E]/80 mb-4">
                Step in. Play hard.
              </span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1E90FF] via-[#00BFFF] to-[#1E90FF]">
                Experience football like never before.
              </span>
            </h1>
            <p
              className="text-[#1A1A2E]/70 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto"
            >
              Join thousands of fans in the ultimate World Cup 2026 experience. Predict matches, play games, win rewards, and celebrate every moment.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-12 sm:px-16 py-4 sm:py-5 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-[#1A1A2E] text-lg sm:text-xl font-bold rounded-full shadow-2xl hover:shadow-[0_0_40px_rgba(30,144,255,0.6)] transition-all inline-flex items-center gap-2 sm:gap-3 min-h-[56px]"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              Start Now
            </button>
            <div
              className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[#1A1A2E]/60 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>24K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>15K+ Predictions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact Section */}
      <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#EDE9E1]">
        <div className="max-w-4xl mx-auto">
          <div
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-3 sm:mb-4">Get In Touch</h2>
            <p className="text-[#1A1A2E]/70 text-sm sm:text-base">Questions? We're here to help</p>
          </div>
          <div
            className="bg-white/95 border border-black/15 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-[#1A1A2E] font-bold mb-2 text-sm sm:text-base">Address</h3>
                <p className="text-[#1A1A2E]/70 text-xs sm:text-sm">
                  XR Interactive Studio<br />
                  123 Innovation Drive<br />
                  Dhaka, Bangladesh
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Phone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-[#1A1A2E] font-bold mb-2 text-sm sm:text-base">Phone</h3>
                <p className="text-[#1A1A2E]/70 text-xs sm:text-sm">
                  +880 1XXX-XXXXXX<br />
                  Available 24/7
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-[#1A1A2E] font-bold mb-2 text-sm sm:text-base">Email</h3>
                <p className="text-[#1A1A2E]/70 text-xs sm:text-sm">
                  info@xrinteractive.com<br />
                  support@fosibon-dk.com
                </p>
              </div>
            </div>
          </div>
          {/* Social Media */}
          <div
            className="text-center"
          >
            <h3 className="text-[#1A1A2E] font-bold mb-4 sm:mb-6 text-sm sm:text-base">Follow Us</h3>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {[
                { icon: Facebook, color: "#1877F2" },
                { icon: Instagram, color: "#E4405F" },
                { icon: Twitter, color: "#1DA1F2" },
              ].map((social, index) => (
                <button
                  key={index}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-white/95 hover:bg-white border border-black/15 rounded-full flex items-center justify-center transition-all"
                >
                  <social.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#1A1A2E]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 border-t border-black/15">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#1A1A2E]/60 mb-2 text-sm sm:text-base">© 2026 XR Interactive. All rights reserved.</p>
          <p className="text-[#1A1A2E]/40 text-xs sm:text-sm">Fosibon-DK Live • World Cup 2026 Experience</p>
        </div>
      </div>
    </div>
  );
}
