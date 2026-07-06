const TOKEN_KEY = "doctorToken";
const USER_KEY = "doctorUser";

export interface DoctorUser {
  id: number;
  userid: string;
  name: string | null;
  phone_number: string | null;
  email: string | null;
  specialization: string | null;
  institution_name_or_chamber_address: string | null;
  division: string | null;
  district: string | null;
  isRegistered: boolean;
  isActive: boolean;
  pso_id: number | null;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): DoctorUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DoctorUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: DoctorUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateStoredUser(user: DoctorUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Endpoint 3 — this frontend's own backend (accounts, SSO exchange, quiz,
// game scores, leaderboards, predictions, highlights, coupons, etc.)
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://api-football.cancercare.pro/api";
export const API_BASE_NOAPI =
  import.meta.env.VITE_API_BASE_URL_NOAPI ??
  "https://api-football.cancercare.pro/";

// Endpoint 2 — the World Cup data backend. Read-only match reference data:
// fixtures (/wc/fixtures*) and graded match results (/match-results).
export const WORLDCUP_API_BASE =
  import.meta.env.VITE_WORLDCUP_API_BASE_URL ??
  "https://backend.cancercareworldcup.com/api";

// The Cancer Care social site — owns accounts/passwords and provides SSO.
export const CANCERCARE_URL =
  import.meta.env.VITE_CANCERCARE_URL ?? "https://cancercare.pro";
export const CANCERCARE_SSO_URL = `${CANCERCARE_URL}/game/sso`;

/**
 * Full-page redirect to cancercare.pro/game/sso — the ONLY way to sign in.
 * If the user has a Cancer Care session they bounce straight back with a
 * one-time code; otherwise Cancer Care shows its login page first.
 * (Loop safety: SSO failures land on /login?sso=failed, which never
 * auto-redirects — retrying requires a click.)
 */
export function redirectToCancerCareSso(): void {
  window.location.replace(CANCERCARE_SSO_URL);
}

/** Swap a one-time SSO code (minted by cancercare.pro) for a game token. */
export async function exchangeSsoCode(
  code: string,
): Promise<{ token: string; user: DoctorUser }> {
  const res = await fetch(`${API_BASE}/sso/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "SSO sign-in failed");
  }

  return { token: data.token as string, user: data.user as DoctorUser };
}

/**
 * Central fetch wrapper. If the server returns 401 (token revoked / expired),
 * clears local auth and fires an event so the app redirects to /login.
 */
async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    clearAuth();
    window.dispatchEvent(new CustomEvent("auth:unauthenticated"));
  }
  return res;
}

/**
 * Calls the backend logout endpoint (revokes the Sanctum token on the server),
 * then clears local auth regardless of server response.
 */
export async function logoutDoctor(): Promise<void> {
  const token = getToken();
  // Fire-and-forget — clear locally even if the request fails
  try {
    await apiFetch(`${API_BASE}/doctor/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Network error — still log out locally
  } finally {
    clearAuth();
  }
}

export async function loginDoctor(
  userid: string,
  password: string,
): Promise<{ token: string; user: DoctorUser }> {
  const res = await fetch(`${API_BASE}/doctor/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ userid, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Login failed");
  }

  return { token: data.token as string, user: data.user as DoctorUser };
}

export async function completeRegistrationApi(payload: {
  name: string;
  phone_number: string;
  email?: string;
  specialization: string;
  institution_name_or_chamber_address: string;
  division: string;
  district: string;
}): Promise<DoctorUser> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/doctor/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Registration failed");
  }

  return data.user as DoctorUser;
}

export async function submitQuizScore(score: number): Promise<void> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/quiz/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to save score");
  }
}

export async function submitGameScore(goals: number): Promise<void> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/game/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score: goals }),
  });

  const data = await res.json();

  // 'limit_reached' means the 5-save daily cap was hit — not an error, just skip silently.
  if (!res.ok && data.status !== "limit_reached") {
    throw new Error(data.message ?? "Failed to save game score");
  }
}

export async function getTodayQuizStatus(): Promise<{
  has_played_quiz: boolean;
  today_quiz_score: number | null;
  today_game_score: number;
  today_total_score: number;
}> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/quiz/today-status`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch quiz status");
  }

  return data as {
    has_played_quiz: boolean;
    today_quiz_score: number | null;
    today_game_score: number;
    today_total_score: number;
  };
}

export interface GameLeaderboardEntry {
  name: string;
  goals: number;
  date: string;
}

export async function fetchGameLeaderboard(): Promise<GameLeaderboardEntry[]> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/game/leaderboard`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch leaderboard");
  }

  return data.data as GameLeaderboardEntry[];
}

/** Returns all individual game plays for the logged-in doctor (newest first). */
export async function fetchMyGamePlays(): Promise<GameLeaderboardEntry[]> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/game/my-plays`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch your game plays");
  }

  return data.data as GameLeaderboardEntry[];
}

export interface LeaderboardEntry {
  id: number;
  userid?: string;
  name: string;
  quiz_score: number;
  game_score: number;
  prediction_score: number;
  other_score: number;
  total: number;
  rank: number;
}

export interface LeaderboardResponse {
  my_stats: LeaderboardEntry;
  leaderboard: LeaderboardEntry[];
}

export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/leaderboard`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch leaderboard");
  }

  return data as LeaderboardResponse;
}

export async function fetchDailyLeaderboard(): Promise<LeaderboardResponse> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/daily-leaderboard`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch daily leaderboard");
  }

  return data as LeaderboardResponse;
}

export interface CouponResult {
  status: 'success' | 'not_eligible' | 'no_coupons';
  coupon_code?: string;
  message?: string;
}

export async function getLiveCoupon(): Promise<CouponResult> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/coupon/live`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (res.status === 403) {
    return { status: 'not_eligible', message: data.message };
  }

  if (res.status === 404) {
    return { status: 'no_coupons', message: data.message };
  }

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch coupon code");
  }

  return { status: 'success', coupon_code: data.coupon_code as string };
}

export interface DailyWinnerEntry {
  date: string;
  rank: number;
  doctor_user_id: number;
  doctor_name: string;
  quiz_score: number;
  game_score: number;
  prediction_score: number;
  total_score: number;
}

/** Fetch the full history of daily winners (public endpoint, no auth required). */
export async function fetchDailyWinners(): Promise<DailyWinnerEntry[]> {
  const res = await fetch(`${API_BASE}/daily-winners`, {
    headers: { Accept: "application/json" },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch daily winners");
  }

  return data.data as DailyWinnerEntry[];
}

// ---------------------------------------------------------------------------
// Match Results
// ---------------------------------------------------------------------------

export interface MatchResult {
  match_key: string;
  home_score: number;
  away_score: number;
}

/** Fetch all graded match results (public, no auth required). */
export async function fetchMatchResults(): Promise<
  Record<string, MatchResult>
> {
  const res = await fetch(`${WORLDCUP_API_BASE}/match-results`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Failed to fetch match results");
  // Key by match_key for O(1) lookup
  const map: Record<string, MatchResult> = {};
  for (const r of data.results as MatchResult[]) {
    map[r.match_key] = r;
  }
  return map;
}

// ---------------------------------------------------------------------------
// Quiz Daily Questions
// ---------------------------------------------------------------------------

export interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  correct_index: number;
  sort_order?: number;
}

/** Fetch today's quiz questions (includes correct_index for client-side feedback). */
export async function fetchTodayQuizQuestions(): Promise<QuizQuestion[]> {
  const res = await fetch(`${API_BASE}/quiz/questions`, {
    headers: { Accept: "application/json" },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch quiz questions");
  }

  return data.data as QuizQuestion[];
}

/** Admin: fetch questions for a specific date (includes correct_index). */
export async function adminFetchQuizQuestions(
  date: string,
): Promise<QuizQuestion[]> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/admin/quiz-questions?date=${date}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch quiz questions");
  }

  return data.data as QuizQuestion[];
}

/** Admin: save (replace) all questions for a specific date. */
export async function adminSaveQuizQuestions(
  date: string,
  questions: QuizQuestion[],
): Promise<void> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/admin/quiz-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ date, questions }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to save quiz questions");
  }
}
