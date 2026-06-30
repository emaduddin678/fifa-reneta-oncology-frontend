export default function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Static Gradient Orbs - No Animation */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#1E90FF]/20 to-transparent rounded-full opacity-50" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#764ba2]/20 to-transparent rounded-full opacity-50" />
      <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-[#00CED1]/15 to-transparent rounded-full opacity-50" />
    </div>
  );
}
