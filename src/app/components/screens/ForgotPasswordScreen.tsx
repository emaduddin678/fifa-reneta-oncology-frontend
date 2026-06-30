import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate sending reset email
      setIsSubmitted(true);
      toast.success("Password reset link sent!");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full  flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          <div className="relative bg-white/95 rounded-[2rem] p-6 sm:p-8 border border-black/15 text-center shadow-lg backdrop-blur-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] mb-3 sm:mb-4">
              Check Your Email
            </h2>
            <p className="text-[#1A1A2E]/70 text-sm sm:text-base mb-6 sm:mb-8">
              We've sent a password reset link to <span className="text-[#1A1A2E] font-medium">{email}</span>
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#1E90FF] to-[#764ba2] text-[#1A1A2E] font-bold rounded-xl min-h-[52px]"
              >
                Back to Login
              </button>
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full py-4 sm:py-5 bg-white/95 text-[#1A1A2E] font-bold rounded-xl min-h-[52px]"
              >
                Resend Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full  flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <div className="relative">
          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-[#1A1A2E]/70 hover:text-[#1A1A2E] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back to Login</span>
          </button>

          <div className="relative bg-white/95 rounded-[2rem] p-6 sm:p-8 border border-black/15 shadow-lg backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-[#1E90FF] to-[#764ba2] rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A2E] mb-2">
                Forgot Password?
              </h2>
              <p className="text-[#1A1A2E]/70 text-sm sm:text-base">
                No worries! Enter your email and we'll send you reset instructions
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-[#1A1A2E]/90 mb-2 sm:mb-3 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/95 border-2 border-black/15 rounded-xl py-4 sm:py-5 px-4 text-[#1A1A2E] text-base sm:text-lg placeholder:text-[#1A1A2E]/40 focus:outline-none focus:border-[#1E90FF] focus:bg-white min-h-[52px]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!email}
                className="relative w-full py-4 sm:py-5 bg-gradient-to-r from-[#1E90FF] to-[#764ba2] text-[#1A1A2E] font-bold rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
              >
                <span className="relative z-10 text-base sm:text-lg">
                  Send Reset Link
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
