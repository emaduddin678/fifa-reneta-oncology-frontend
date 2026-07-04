import { useState, useEffect } from "react";

import bgMobile from "@/imports/Fifa_Worldcup_bg_mobile.png";
import bgDesktop from "@/imports/Fifa_Worldcup_bg_Desktop.png";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  BadgeHelp,
} from "lucide-react";
import { toast } from "sonner";
import PremiumBackground from "../PremiumBackground";
import {
  submitQuizScore,
  getTodayQuizStatus,
  fetchTodayQuizQuestions,
  type QuizQuestion,
} from "@/app/lib/auth";

function ScreenBackground() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 z-0 sm:hidden"
          style={{
            backgroundImage: `url(${bgMobile})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0 z-0 hidden sm:block"
          style={{
            backgroundImage: `url(${bgDesktop})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>
      <div className="opacity-[0.04] fixed inset-0 pointer-events-none z-0">
        <PremiumBackground />
      </div>
    </>
  );
}

export default function QuizScreen() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [noQuestions, setNoQuestions] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    Promise.all([
      getTodayQuizStatus().catch(() => null),
      fetchTodayQuizQuestions().catch(() => []),
    ]).then(([status, qs]) => {
      if (status?.has_played_quiz) {
        setAlreadyPlayed(true);
        setTodayScore(status.today_quiz_score);
      }
      if (qs.length === 0) {
        setNoQuestions(true);
      } else {
        setQuestions(qs);
      }
      setStatusLoading(false);
    });
  }, []);

  // 15-second countdown per question; -1 means timed out (shows correct answer briefly)
  useEffect(() => {
    if (
      questions.length === 0 ||
      showResult ||
      selectedAnswer !== null ||
      statusLoading
    )
      return;

    setTimeLeft(15);
    let remaining = 15;

    const interval = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setSelectedAnswer(-1);

        const currQ = currentQuestion;
        const currScore = score;

        setTimeout(() => {
          setSelectedAnswer(null);
          if (currQ < questions.length - 1) {
            setCurrentQuestion(currQ + 1);
          } else {
            setShowResult(true);
            toast.success(`Quiz completed! You earned ${currScore} points`);
            submitQuizScore(currScore).catch((err: Error) => {
              toast.error(err.message ?? "Could not save your score.");
            });
          }
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentQuestion,
    selectedAnswer,
    questions.length,
    showResult,
    statusLoading,
  ]);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    const isCorrect = index === questions[currentQuestion].correct_index;

    setTimeout(() => {
      const nextScore = score + (isCorrect ? 25 : 0);

      if (currentQuestion < questions.length - 1) {
        setScore(nextScore);
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        const finalScore = nextScore;
        setScore(finalScore);
        setShowResult(true);
        toast.success(`Quiz completed! You earned ${finalScore} points`);

        submitQuizScore(finalScore).catch((err: Error) => {
          toast.error(err.message ?? "Could not save your score.");
        });
      }
    }, 1000);
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] relative">
        <ScreenBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen flex-col gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-[#A78BFA] rounded-full animate-spin" />
          <span className="text-white/30 text-xs tracking-widest uppercase">
            Loading quiz...
          </span>
        </div>
      </div>
    );
  }

  if (alreadyPlayed) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] relative flex items-center justify-center p-4 sm:p-6">
        <ScreenBackground />
        <div className="relative z-10 bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD700]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Already Played!
          </h2>
          <p className="text-white/40 text-sm mb-6">Your score for today</p>
          <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] mb-6">
            {todayScore}
          </div>
          <div className="flex items-center gap-1.5 justify-center bg-white/[0.05] border border-white/10 rounded-full px-4 py-2 mb-6 mx-auto w-fit">
            <span className="text-[10px] text-white/40 tracking-widest uppercase">
              New questions tomorrow
            </span>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#1E90FF] to-[#667eea] text-white font-black text-sm tracking-widest uppercase shadow-[0_8px_32px_rgba(30,144,255,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-150"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (noQuestions) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] relative flex items-center justify-center p-4 sm:p-6">
        <ScreenBackground />
        <div className="relative z-10 bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center">
            <BadgeHelp className="w-8 h-8 sm:w-10 sm:h-10 text-[#A78BFA]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            No Quiz Today
          </h2>
          <p className="text-white/40 text-sm mb-6">
            No questions have been set for today. Check back later!
          </p>
          <button
            onClick={() => navigate("/home")}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#1E90FF] to-[#667eea] text-white font-black text-sm tracking-widest uppercase shadow-[0_8px_32px_rgba(30,144,255,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-150"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] relative flex items-center justify-center p-4 sm:p-6">
        <ScreenBackground />
        <div className="relative z-10 bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD700]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Quiz Complete!
          </h2>
          <p className="text-white/40 text-sm mb-6">Your Score</p>
          <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] mb-6">
            {score}
          </div>
          <p className="text-white/50 text-sm mb-8">
            {score >= 75
              ? "Excellent! You're a football expert!"
              : score >= 50
                ? "Good job! Keep learning!"
                : "Nice try! Play again to improve!"}
          </p>
          <div className="flex gap-2 justify-center mb-6">
            {[
              { label: "Correct", value: score / 25 },
              { label: "Questions", value: questions.length },
              { label: "Max", value: questions.length * 25 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-1 bg-white/[0.05] border border-white/[0.07] rounded-2xl py-2 px-1 text-center"
              >
                <div className="text-white font-black text-lg">
                  {stat.value}
                </div>
                <div className="text-white/30 text-[9px] uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/home")}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#1E90FF] to-[#667eea] text-white font-black text-sm tracking-widest uppercase shadow-[0_8px_32px_rgba(30,144,255,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-150"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isTimedOut = selectedAnswer === -1;
  const displayTime = isTimedOut ? 0 : timeLeft;
  const timerColor =
    displayTime > 9 ? "#22c55e" : displayTime > 4 ? "#f59e0b" : "#ef4444";
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - displayTime / 15);
  const isLowTime = timeLeft <= 5 && !isTimedOut && selectedAnswer === null;

  return (
    <div className="min-h-screen bg-[#0A0E1A] relative">
      <ScreenBackground />

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0A0E1A]/80 backdrop-blur-md border-b border-white/[0.07]">
        <button
          onClick={() => navigate("/home")}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#A78BFA] rounded-full" />
          <span className="text-sm font-black text-white tracking-widest uppercase">
            Trivia Quiz
          </span>
          <div className="w-1 h-4 bg-[#A78BFA] rounded-full" />
        </div>

        <div className="flex items-center gap-1.5 bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1.5 rounded-full">
          <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
          <span className="text-[#FFD700] text-sm font-black">{score}</span>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-5 max-w-2xl mx-auto">
        {/* Progress — dot indicators per question */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i < currentQuestion
                      ? "w-2 h-2 bg-[#A78BFA]"
                      : i === currentQuestion
                        ? "w-4 h-2 bg-[#A78BFA]"
                        : "w-2 h-2 bg-white/[0.12]"
                  }`}
                />
              ))}
            </div>
            <span className="text-white/30 text-[11px] font-bold">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#A78BFA] to-[#1E90FF] rounded-full transition-all duration-500"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <span className="text-white/25 text-[10px] uppercase tracking-widest font-bold">
            Time
          </span>
          <div className={isLowTime ? "animate-pulse" : ""}>
            <svg width="80" height="80" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r={radius}
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.06"
                strokeWidth="3"
              />
              <circle
                cx="26"
                cy="26"
                r={radius}
                fill="none"
                stroke={timerColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 26 26)"
                style={{
                  transition: "stroke-dashoffset 0.8s linear, stroke 0.4s ease",
                }}
              />
              <text
                x="26"
                y="26"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fontWeight="900"
                fill={timerColor}
              >
                {displayTime}
              </text>
            </svg>
          </div>
          <span
            className={`text-[10px] uppercase tracking-widest font-bold ${
              isTimedOut
                ? "text-red-400"
                : isLowTime
                  ? "text-[#f59e0b]"
                  : "text-white/25"
            }`}
          >
            {isTimedOut ? "Time's up" : isLowTime ? "Hurry!" : "Sec left"}
          </span>
        </div>

        {/* Question Card */}
        <div
          key={currentQuestion}
          className="bg-[#0D1526] border border-white/[0.10] rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_48px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-[#A78BFA]/10 border border-[#A78BFA]/20 rounded-lg px-2.5 py-1">
              <span className="text-[#A78BFA] text-[10px] font-black tracking-widest uppercase">
                Q{currentQuestion + 1}
              </span>
            </div>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug mb-6 sm:mb-8">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-2">
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect =
                index === questions[currentQuestion].correct_index;
              const showFeedback = selectedAnswer !== null;
              const letter = ["A", "B", "C", "D"][index];

              const buttonClasses = showFeedback
                ? isCorrect
                  ? "bg-[#34D399]/[0.12] border-[#34D399]/50 shadow-[0_0_24px_rgba(52,211,153,0.15)]"
                  : isSelected
                    ? "bg-red-500/10 border-red-400/40 shadow-[0_0_24px_rgba(239,68,68,0.12)]"
                    : "bg-white/[0.03] border-white/[0.05] opacity-50 pointer-events-none"
                : "bg-white/[0.08] border-white/[0.12] hover:bg-white/[0.13] hover:border-white/25 hover:shadow-[0_0_20px_rgba(167,139,250,0.08)] cursor-pointer";

              const chipClasses = showFeedback
                ? isCorrect
                  ? "bg-[#34D399]/20 border-[#34D399]/40"
                  : isSelected
                    ? "bg-red-500/20 border-red-400/40"
                    : "bg-white/[0.08] border-white/10"
                : "bg-white/[0.08] border-white/10";

              const letterClasses = showFeedback
                ? isCorrect
                  ? "text-[#34D399]"
                  : isSelected
                    ? "text-red-400"
                    : "text-white/50"
                : "text-white/50";

              const optionTextClasses = showFeedback
                ? isCorrect
                  ? "text-[#34D399] font-semibold"
                  : isSelected
                    ? "text-red-300 font-semibold"
                    : "text-white/90"
                : "text-white/90";

              return (
                <button
                  key={index}
                  onClick={() => selectedAnswer === null && handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left border transition-all duration-150 active:scale-[0.99] ${buttonClasses}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex-shrink-0 border flex items-center justify-center ${chipClasses}`}
                  >
                    <span className={`text-xs font-black ${letterClasses}`}>
                      {letter}
                    </span>
                  </div>
                  <span
                    className={`text-sm sm:text-base flex-1 ${optionTextClasses}`}
                  >
                    {option}
                  </span>
                  {showFeedback && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-[#34D399] ml-auto flex-shrink-0" />
                  )}
                  {showFeedback && !isCorrect && isSelected && (
                    <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-white/25 text-xs tracking-wide mt-2">
          Earn 25 points for each correct answer
        </p>
      </div>
    </div>
  );
}
