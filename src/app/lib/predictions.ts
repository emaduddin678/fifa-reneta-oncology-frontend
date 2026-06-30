import { getToken, API_BASE } from "./auth";
import type { Match } from "./matches";
import { matchKey } from "./matches";

export interface MatchResult {
  match_key: string;
  home_score: number;
  away_score: number;
}

export interface Prediction {
  id: number;
  match_key: string;
  home_team: string;
  away_team: string;
  home_flag: string | null;
  away_flag: string | null;
  match_date: string;
  match_time: string | null;
  home_score: number;
  away_score: number;
  created_at: string;
}

async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent("auth:unauthenticated"));
  }
  return res;
}

export async function submitPrediction(
  match: Match,
  homeScore: number,
  awayScore: number,
): Promise<Prediction> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/predictions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      match_key: matchKey(match),
      home_team: match.homeName,
      away_team: match.awayName,
      home_flag: match.homeFlag,
      away_flag: match.awayFlag,
      match_date: match.date,
      match_time: match.time,
      home_score: homeScore,
      away_score: awayScore,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to submit prediction");
  }

  return data.prediction as Prediction;
}

export async function fetchMatchResults(): Promise<MatchResult[]> {
  const res = await fetch(`${API_BASE}/match-results`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Failed to load results");
  return data.results as MatchResult[];
}

export async function fetchMyPredictions(): Promise<Prediction[]> {
  const token = getToken();

  const res = await apiFetch(`${API_BASE}/predictions/mine`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to load predictions");
  }

  return data.predictions as Prediction[];
}
