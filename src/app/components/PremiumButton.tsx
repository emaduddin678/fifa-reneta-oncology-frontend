import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PremiumButtonProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  fullWidth?: boolean;
}

export default function PremiumButton({
  children,
  onClick,
  icon: Icon,
  variant = 'primary',
  className = "",
  fullWidth = false
}: PremiumButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-[#1E90FF] to-[#764ba2] text-white",
    secondary: "bg-gradient-to-r from-white/80 to-white/60 border-2 border-black/10 text-[#1A1A2E]",
    outline: "bg-transparent border-2 border-[#1E90FF]/50 text-[#1A1A2E]"
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl py-3 px-6 font-bold
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </span>
    </button>
  );
}
