import image_Asset_16_9 from "@/imports/Asset_1.png";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Activity,
  Image,
  Trophy,
  TrendingUp,
  ArrowLeft,
  Zap,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  adminFetchQuizQuestions,
  adminSaveQuizQuestions,
  type QuizQuestion,
} from "@/app/lib/auth";
import { toast } from "sonner";

const statsData = [
  { name: "Mon", users: 120, predictions: 85, photos: 45 },
  { name: "Tue", users: 180, predictions: 132, photos: 67 },
  { name: "Wed", users: 245, predictions: 178, photos: 89 },
  { name: "Thu", users: 320, predictions: 234, photos: 112 },
  { name: "Fri", users: 410, predictions: 298, photos: 156 },
  { name: "Sat", users: 580, predictions: 421, photos: 234 },
  { name: "Sun", users: 520, predictions: 385, photos: 198 },
];

const recentUsers = [
  {
    name: "Carlos Silva",
    activity: "Made a prediction",
    time: "2m ago",
    avatar: "🇧🇷",
  },
  {
    name: "Maria Garcia",
    activity: "Generated AI photo",
    time: "5m ago",
    avatar: "🇪🇸",
  },
  {
    name: "Ahmed Hassan",
    activity: "Completed quiz",
    time: "8m ago",
    avatar: "🇪🇬",
  },
  {
    name: "Emma Johnson",
    activity: "Joined game",
    time: "12m ago",
    avatar: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Quiz Questions Manager state
  const today = new Date().toISOString().split("T")[0];
  const [quizDate, setQuizDate] = useState(today);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizPanelOpen, setQuizPanelOpen] = useState(false);

  const loadQuizQuestions = useCallback(async (date: string) => {
    setQuizLoading(true);
    try {
      const qs = await adminFetchQuizQuestions(date);
      setQuizQuestions(qs);
    } catch {
      setQuizQuestions([]);
    } finally {
      setQuizLoading(false);
    }
  }, []);

  useEffect(() => {
    if (quizPanelOpen) loadQuizQuestions(quizDate);
  }, [quizPanelOpen, quizDate, loadQuizQuestions]);

  const addQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], correct_index: 0 },
    ]);
  };

  const removeQuestion = (i: number) => {
    setQuizQuestions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (
    i: number,
    field: keyof QuizQuestion,
    value: string | number | string[],
  ) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => (idx === i ? { ...q, [field]: value } : q)),
    );
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qi) return q;
        const opts = [...q.options];
        opts[oi] = value;
        return { ...q, options: opts };
      }),
    );
  };

  const saveQuizQuestions = async () => {
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        return;
      }
      if (q.correct_index >= q.options.length) {
        toast.error(`Question ${i + 1}: correct answer out of range`);
        return;
      }
    }
    setQuizSaving(true);
    try {
      await adminSaveQuizQuestions(quizDate, quizQuestions);
      toast.success(
        `${quizQuestions.length} question(s) saved for ${quizDate}`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save questions",
      );
    } finally {
      setQuizSaving(false);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-[#EDE9E1] border-b border-black/15 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-[#1A1A2E] w-11 h-11 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Company Logo */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
              <ImageWithFallback
                src={image_Asset_16_9}
                alt="Rolac Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="text-[#1A1A2E]/70 text-xs sm:text-sm">
            Last updated: Just now
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/95 border border-black/15 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1E90FF]/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E90FF]" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <h3 className="text-[#1A1A2E]/70 text-xs sm:text-sm mb-1">
              Total Users
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">
              24,580
            </p>
            <p className="text-green-400 text-xs sm:text-sm mt-2">
              +12% from last week
            </p>
          </div>

          <div className="bg-white/95 border border-black/15 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#1E90FF]/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#1E90FF]" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-[#1A1A2E]/70 text-sm mb-1">Active Users</h3>
            <p className="text-3xl font-bold text-[#1A1A2E]">8,943</p>
            <p className="text-green-400 text-sm mt-2">+8% from yesterday</p>
          </div>

          <div className="bg-white/95 border border-black/15 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#1E90FF]/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#1E90FF]" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-[#1A1A2E]/70 text-sm mb-1">Predictions</h3>
            <p className="text-3xl font-bold text-[#1A1A2E]">15,234</p>
            <p className="text-green-400 text-sm mt-2">+24% today</p>
          </div>

          <div className="bg-white/95 border border-black/15 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#1E90FF]/20 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-[#1E90FF]" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-[#1A1A2E]/70 text-sm mb-1">Photos Generated</h3>
            <p className="text-3xl font-bold text-[#1A1A2E]">6,789</p>
            <p className="text-green-400 text-sm mt-2">+18% this week</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Engagement Trend */}
          <div className="bg-white/95 border border-black/15 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-[#1A1A2E] font-bold mb-4 sm:mb-6 text-sm sm:text-base">
              Engagement Trend
            </h3>
            <ResponsiveContainer
              width="100%"
              height={200}
              className="sm:h-[250px]"
            >
              <LineChart data={statsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(247, 245, 240, 0.95)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    color: "#1A1A2E",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#1E90FF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Breakdown */}
          <div className="bg-white/95 border border-black/15 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-[#1A1A2E] font-bold mb-4 sm:mb-6 text-sm sm:text-base">
              Activity Breakdown
            </h3>
            <ResponsiveContainer
              width="100%"
              height={200}
              className="sm:h-[250px]"
            >
              <BarChart data={statsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(247, 245, 240, 0.95)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    color: "#1A1A2E",
                  }}
                />
                <Bar dataKey="predictions" fill="#1E90FF" />
                <Bar dataKey="photos" fill="#00BFFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity & User List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <div className="bg-white/95 border border-black/15 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-[#1A1A2E] font-bold mb-4 sm:mb-6 text-sm sm:text-base">
              Recent Activity
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {recentUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-black/15 last:border-0"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-full flex items-center justify-center flex-shrink-0 text-lg sm:text-xl">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A1A2E] font-bold text-xs sm:text-sm truncate">
                      {user.name}
                    </p>
                    <p className="text-[#1A1A2E]/70 text-xs sm:text-sm">
                      {user.activity}
                    </p>
                  </div>
                  <span className="text-[#1A1A2E]/50 text-[10px] sm:text-xs flex-shrink-0">
                    {user.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white/95 border border-black/15 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-[#1A1A2E] font-bold mb-4 sm:mb-6 text-sm sm:text-base">
              Top Performers
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {[
                { name: "Carlos Silva", points: 2850, rank: 1 },
                { name: "Maria Garcia", points: 2720, rank: 2 },
                { name: "Ahmed Hassan", points: 2640, rank: 3 },
                { name: "Emma Johnson", points: 2480, rank: 4 },
              ].map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 sm:p-3 bg-white/95 rounded-xl"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        {user.rank}
                      </span>
                    </div>
                    <span className="text-[#1A1A2E] font-bold text-xs sm:text-sm truncate">
                      {user.name}
                    </span>
                  </div>
                  <span className="text-[#1E90FF] font-bold text-xs sm:text-sm flex-shrink-0 ml-2">
                    {user.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Questions Manager */}
        <div className="mt-6 sm:mt-8 bg-white/95 border border-black/15 rounded-xl sm:rounded-2xl overflow-hidden">
          <button
            onClick={() => setQuizPanelOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1E90FF]/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#1E90FF]" />
              </div>
              <div>
                <h3 className="text-[#1A1A2E] font-bold text-sm sm:text-base">
                  Quiz Questions Manager
                </h3>
                <p className="text-[#1A1A2E]/50 text-xs">
                  Set daily quiz questions for any date
                </p>
              </div>
            </div>
            {quizPanelOpen ? (
              <ChevronUp className="w-5 h-5 text-[#1A1A2E]/50" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#1A1A2E]/50" />
            )}
          </button>

          {quizPanelOpen && (
            <div className="border-t border-black/10 px-4 sm:px-6 py-5 space-y-5">
              {/* Date Picker */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <label className="text-[#1A1A2E] font-semibold text-sm whitespace-nowrap">
                  Quiz Date:
                </label>
                <input
                  type="date"
                  value={quizDate}
                  onChange={(e) => setQuizDate(e.target.value)}
                  className="border border-black/15 rounded-lg px-3 py-2 text-sm text-[#1A1A2E] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                />
                <span className="text-[#1A1A2E]/50 text-xs">
                  {quizQuestions.length} question(s) loaded
                </span>
              </div>

              {/* Loading */}
              {quizLoading && (
                <p className="text-[#1A1A2E]/50 text-sm">
                  Loading questions...
                </p>
              )}

              {/* Questions List */}
              {!quizLoading && (
                <div className="space-y-4">
                  {quizQuestions.map((q, qi) => (
                    <div
                      key={qi}
                      className="border border-black/10 rounded-xl p-4 space-y-3 bg-white/60"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[#1E90FF] font-bold text-sm">
                          Q{qi + 1}
                        </span>
                        <button
                          onClick={() => removeQuestion(qi)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Question text..."
                        value={q.question}
                        onChange={(e) =>
                          updateQuestion(qi, "question", e.target.value)
                        }
                        className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm text-[#1A1A2E] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qi}`}
                              checked={q.correct_index === oi}
                              onChange={() =>
                                updateQuestion(qi, "correct_index", oi)
                              }
                              className="accent-[#1E90FF] flex-shrink-0"
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${oi + 1}`}
                              value={opt}
                              onChange={(e) =>
                                updateOption(qi, oi, e.target.value)
                              }
                              className={`flex-1 border rounded-lg px-3 py-2 text-sm text-[#1A1A2E] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF] ${q.correct_index === oi ? "border-green-400" : "border-black/15"}`}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[#1A1A2E]/40 text-xs">
                        Select the radio button next to the correct answer
                      </p>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={addQuestion}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#1E90FF]/40 rounded-xl text-[#1E90FF] text-sm hover:border-[#1E90FF] transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Question
                    </button>
                    {quizQuestions.length > 0 && (
                      <button
                        onClick={saveQuizQuestions}
                        disabled={quizSaving}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white rounded-xl text-sm font-bold disabled:opacity-60"
                      >
                        <Save className="w-4 h-4" />
                        {quizSaving
                          ? "Saving..."
                          : `Save ${quizQuestions.length} Question(s)`}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-[#1A1A2E]/40 text-sm">
            XR Interactive • Fosibon-DK Live Campaign • World Cup 2026
          </p>
        </div>
      </div>
    </div>
  );
}
