import { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export default function PremiumCard({ children, className = "" }: PremiumCardProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative bg-white/95 rounded-2xl border border-black/15 overflow-hidden shadow-sm backdrop-blur-sm">
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
