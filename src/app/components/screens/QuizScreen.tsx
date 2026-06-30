import image_Asset_1_6 from "@/imports/Asset_1.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Trophy, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  submitQuizScore,
  getTodayQuizStatus,
  fetchTodayQuizQuestions,
  type QuizQuestion,
} from "@/app/lib/auth";

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
    if (questions.length === 0 || showResult || selectedAnswer !== null || statusLoading) return;

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
  }, [currentQuestion, selectedAnswer, questions.length, showResult, statusLoading]);

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#1A1A2E]/60 text-sm">Loading...</p>
      </div>
    );
  }

  if (alreadyPlayed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white/95 border border-black/15 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg backdrop-blur-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Already Played!
          </h2>
          <p className="text-[#1A1A2E]/70 mb-4 sm:mb-6 text-sm sm:text-base">
            Your score for today
          </p>
          <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1E90FF] to-[#00BFFF] mb-6 sm:mb-8">
            {todayScore}
          </div>
          <p className="text-[#1A1A2E]/70 mb-6 sm:mb-8 text-sm sm:text-base">
            Come back tomorrow for new questions! 🌟
          </p>
          <button
            onClick={() => navigate("/home")}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white rounded-xl text-sm sm:text-base font-bold min-h-[48px]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (noQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white/95 border border-black/15 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg backdrop-blur-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            No Quiz Today
          </h2>
          <p className="text-[#1A1A2E]/70 mb-6 sm:mb-8 text-sm sm:text-base">
            No questions have been set for today. Check back later! 🌟
          </p>
          <button
            onClick={() => navigate("/home")}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white rounded-xl text-sm sm:text-base font-bold min-h-[48px]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white/95  border border-black/15 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg backdrop-blur-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Quiz Complete!
          </h2>
          <p className="text-[#1A1A2E]/70 mb-4 sm:mb-6 text-sm sm:text-base">
            Your Score
          </p>
          <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1E90FF] to-[#00BFFF] mb-6 sm:mb-8">
            {score}
          </div>
          <p className="text-[#1A1A2E]/80 mb-6 sm:mb-8 text-sm sm:text-base">
            {score >= 75
              ? "Excellent! You're a football expert! 🏆"
              : score >= 50
                ? "Good job! Keep learning! ⚽"
                : "Nice try! Play again to improve! 💪"}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/home")}
              className="w-full py-3 sm:py-4 bg-[#1E90FF] text-white rounded-xl text-sm sm:text-base font-bold min-h-[48px]"
            >
              Back to Home
            </button>
          </div>
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
    <div className="min-h-screen ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/95 backdrop-blur-md border-b border-black/15">
        <button
          onClick={() => navigate("/home")}
          className="text-[#1A1A2E] w-11 h-11 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Company Logo */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
          <ImageWithFallback
            src={image_Asset_1_6}
            alt="Rolac Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1E90FF]/20 px-2.5 sm:px-3 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E90FF]" />
          <span className="text-[#1A1A2E] text-sm sm:text-base">{score}</span>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-5 sm:mb-6">
          <div className="flex justify-between text-[#1A1A2E]/70 text-xs sm:text-sm mb-2">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/95 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1E90FF] to-[#0066CC]"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <div className={isLowTime ? "animate-pulse" : ""}>
            <svg width="64" height="64" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
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
                style={{ transition: "stroke-dashoffset 0.8s linear, stroke 0.4s ease" }}
              />
              <text
                x="26"
                y="26"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="13"
                fontWeight="bold"
                fill={timerColor}
              >
                {displayTime}
              </text>
            </svg>
          </div>
          {isTimedOut && (
            <p className="text-red-500 text-xs sm:text-sm font-medium mt-1">
              Time's up!
            </p>
          )}
          {isLowTime && (
            <p className="text-[#f59e0b] text-xs sm:text-sm font-medium mt-1">
              Hurry up!
            </p>
          )}
        </div>

        {/* Question Card */}
        <div
          key={currentQuestion}
          className="bg-white/95  border border-black/15 rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 shadow-lg backdrop-blur-sm"
        >
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1A1A2E] mb-6 sm:mb-8">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-2 sm:space-y-3">
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect =
                index === questions[currentQuestion].correct_index;
              const showFeedback = selectedAnswer !== null;

              return (
                <button
                  key={index}
                  onClick={() => selectedAnswer === null && handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-3 sm:p-4 rounded-xl text-left transition-all flex items-center justify-between gap-3 min-h-[52px] ${
                    showFeedback
                      ? isSelected
                        ? isCorrect
                          ? "bg-green-500/20 border-2 border-green-500"
                          : "bg-red-500/20 border-2 border-red-500"
                        : isCorrect
                          ? "bg-green-500/20 border-2 border-green-500"
                          : "bg-white/95 border-2 border-black/15"
                      : "bg-white/95 border-2 border-black/15 hover:border-black/15 cursor-pointer"
                  }`}
                >
                  <span className="text-[#1A1A2E] text-sm sm:text-base">
                    {option}
                  </span>
                  {showFeedback && (isSelected || isCorrect) && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[#1A1A2E]/50 text-xs sm:text-sm">
          Earn 25 points for each correct answer!
        </p>
      </div>
    </div>
  );
}
