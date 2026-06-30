import { API_BASE } from "./auth";

/**
 * WcFixture matches the shape returned by GET /api/wc/fixtures.
 * All date/time fields are in BD time (UTC+6) — already converted server-side.
 */
export interface WcFixture {
  id: number;
  sportmonks_id: number;
  match_key: string; // "ENG_CRO_2026-06-18" — links to predictions
  home_team: string;
  away_team: string;
  home_code: string; // "ENG"
  away_code: string; // "CRO"
  home_flag: string | null; // Sportmonks CDN URL
  away_flag: string | null;
  group_name: string | null; // "Group Stage", "Round of 32", "Final"
  stage: string; // "group_stage" | "knockout"
  round_name: string | null; // "1", "2", "3"
  // All BD time (UTC+6) — ready for display
  match_date: string; // "2026-06-18"
  match_date_label: string; // "Jun 18"
  match_time: string; // "2:00 AM"
  match_datetime_bd: string; // "Jun 18, 2:00 AM"
  status: "upcoming" | "live" | "done";
  /** Sportmonks state_id: 2=1st Half, 3=HT, 4=2nd Half, 5=ET, 6=Break, 11=1ET, 12=ET HT, 13=2ET */
  state_id: number | null;
  is_placeholder: boolean;
  home_score: number | null;
  away_score: number | null;
  stats?: Record<string, unknown> | null;
}

/**
 * Fetch all WC fixtures from our backend (not Sportmonks directly).
 * Returns full tournament schedule with BD times and live scores.
 */
export async function fetchAllFixtures(): Promise<WcFixture[]> {
  const res = await fetch(`${API_BASE}/wc/fixtures`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Failed to load fixtures");
  return data.fixtures as WcFixture[];
}

/**
 * Fetch today's fixtures in BD time.
 */
export async function fetchTodayFixtures(): Promise<WcFixture[]> {
  const res = await fetch(`${API_BASE}/wc/fixtures/today`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message ?? "Failed to load today's fixtures");
  return data.fixtures as WcFixture[];
}

/**
 * Fetch currently live fixtures (status = 'live').
 */
export async function fetchLiveFixtures(): Promise<WcFixture[]> {
  const res = await fetch(`${API_BASE}/wc/fixtures/live`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Failed to load live fixtures");
  return data.fixtures as WcFixture[];
}

/**
 * Fetch a single fixture with post-match stats.
 */
export async function fetchFixtureById(id: number): Promise<WcFixture> {
  const res = await fetch(`${API_BASE}/wc/fixtures/${id}`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Failed to load fixture");
  return data.fixture as WcFixture;
}

/**
 * Convert a WcFixture to the legacy Match shape so existing screens
 * (PredictionScreen, FixtureScreen) work without changes.
 */
export function wcFixtureToMatch(f: WcFixture): import("./matches").Match {
  return {
    homeCode: f.home_code,
    homeName: f.home_team,
    homeFlag:
      f.home_flag ?? `https://flagcdn.com/w80/${f.home_code.toLowerCase()}.png`,
    awayCode: f.away_code,
    awayName: f.away_team,
    awayFlag:
      f.away_flag ?? `https://flagcdn.com/w80/${f.away_code.toLowerCase()}.png`,
    date: f.match_date,
    dateLabel: f.match_date_label,
    time: f.match_time,
    group: f.group_name ?? f.stage,
    status: f.status,
  };
}
