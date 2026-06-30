import image_Asset_1_1 from '@/imports/Asset_1.png'
import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Lock, Sparkles, ChevronRight, Shield } from "lucide-react";
import { toast } from "sonner";
import { loginDoctor, setAuth } from "@/app/lib/auth";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    try {
      const { token, user } = await loginDoctor(username, password);
      setAuth(token, user);

      if (user.isRegistered) {
        toast.success("Welcome back!");
        navigate("/home", { replace: true });
      } else {
        toast.success("Login successful! Please complete your profile.");
        navigate("/register", { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full  flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <div className="relative bg-white rounded-[2rem] p-6 sm:p-8 border border-black/15 shadow-sm">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              {/* Rolac Logo */}
              <div className="flex justify-center mb-4 sm:mb-5">
                <img
                  src={image_Asset_1_1}
                  alt="Rolac – Ketorolac Tromethamine USP"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>

              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#1E90FF]/20 to-[#667eea]/20 rounded-full border border-[#1E90FF]/30">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD700]" />
                <span className="text-xs sm:text-sm text-[#1A1A2E]/90">Secure Login</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A2E] mb-2">
                Welcome Back
              </h2>
              <p className="text-[#1A1A2E]/70 text-sm sm:text-base">
                Enter your credentials to continue
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-[#1A1A2E]/90 mb-2 sm:mb-3 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-white/95 border-2 border-black/15 rounded-xl py-4 sm:py-5 px-4 text-[#1A1A2E] text-base sm:text-lg placeholder:text-[#1A1A2E]/40 focus:outline-none focus:border-[#1E90FF] focus:bg-white/95 min-h-[52px]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="text-[#1A1A2E]/90 font-medium flex items-center gap-2 text-sm sm:text-base">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[#1E90FF] hover:text-[#00BFFF] text-xs sm:text-sm font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/95 border-2 border-black/15 rounded-xl py-4 sm:py-5 px-4 text-[#1A1A2E] text-base sm:text-lg placeholder:text-[#1A1A2E]/40 focus:outline-none focus:border-[#1E90FF] focus:bg-white/95 min-h-[52px]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!username || !password || loading}
                className="relative w-full py-4 sm:py-5 bg-gradient-to-r from-[#1E90FF] to-[#764ba2] text-[#1A1A2E] font-bold rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-base sm:text-lg">
                  {loading ? "Logging in…" : "Login"}
                  {!loading && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                </span>
              </button>

              <p className="text-center text-[#1A1A2E]/50 text-xs sm:text-sm flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Secure & encrypted login
              </p>
            </form>
        </div>
      </div>
    </div>
  );
}
