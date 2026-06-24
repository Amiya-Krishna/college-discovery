"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Exam = "JEE Main" | "JEE Advanced" | "NEET" | "CAT" | "CUET" | "Other";

type ExamConfig = {
  id: Exam;
  icon: string;
  color: string;
  dot: string;
  border: string;
  bg: string;
  maxRank: number;
  placeholder: string;
  hint: string;
};

const EXAMS: ExamConfig[] = [
  { id: "JEE Main", icon: "⚙️", color: "text-blue-400", dot: "bg-blue-500", border: "border-blue-500/30", bg: "bg-blue-500/10", maxRank: 1200000, placeholder: "e.g. 45000", hint: "CRL rank out of ~12 lakh" },
  { id: "JEE Advanced", icon: "🔬", color: "text-violet-400", dot: "bg-violet-500", border: "border-violet-500/30", bg: "bg-violet-500/10", maxRank: 50000, placeholder: "e.g. 3500", hint: "Rank out of ~50k qualifiers" },
  { id: "NEET", icon: "🩺", color: "text-rose-400", dot: "bg-rose-500", border: "border-rose-500/30", bg: "bg-rose-500/10", maxRank: 2000000, placeholder: "e.g. 12000", hint: "All-India rank out of ~20 lakh" },
  { id: "CAT", icon: "📈", color: "text-amber-400", dot: "bg-amber-500", border: "border-amber-500/30", bg: "bg-amber-500/10", maxRank: 100, placeholder: "e.g. 97.5", hint: "Percentile (not rank)" },
  { id: "CUET", icon: "🎓", color: "text-cyan-400", dot: "bg-cyan-500", border: "border-cyan-500/30", bg: "bg-cyan-500/10", maxRank: 1000000, placeholder: "e.g. 85000", hint: "Score or rank" },
  { id: "Other", icon: "📝", color: "text-slate-400", dot: "bg-slate-500", border: "border-slate-500/30", bg: "bg-slate-500/10", maxRank: 9999999, placeholder: "e.g. 500", hint: "State exam / other rank" },
];

type Category = "General" | "OBC" | "SC" | "ST" | "EWS";
const CATEGORIES: Category[] = ["General", "OBC", "SC", "ST", "EWS"];

type HomeState = "home" | "anywhere" | "specific";
const HOME_STATE_OPTIONS = [
  { value: "home" as HomeState, label: "Home state quota", icon: "🏠", desc: "Prefer colleges in my state" },
  { value: "anywhere" as HomeState, label: "All India", icon: "🌏", desc: "Open to any state" },
  { value: "specific" as HomeState, label: "Specific state", icon: "📍", desc: "I have a target state" },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Chandigarh",
];

type Recommendation = {
  collegeId: string;
  score: number;
  explanation: string;
};

type RecommendErrorResponse = {
  error?: string;
  issues?: Record<string, string[]>;
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PredictPage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [rank, setRank] = useState("");
  const [maxFees, setMaxFees] = useState("");
  const [category, setCategory] = useState<Category>("General");
  const [homeState, setHomeState] = useState<HomeState>("anywhere");
  const [specificState, setSpecificState] = useState("");
  const [preference, setPreference] = useState("");

  const [result, setResult] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [recommendError, setRecommendError] = useState("");

  const examConfig = EXAMS.find((e) => e.id === exam);
  const isCat = exam === "CAT";
  const rankNum = parseFloat(rank);
  const maxFeesNum = parseFloat(maxFees);
  const rankValid = rank.trim() !== "" && !isNaN(rankNum) && rankNum > 0;
  const maxFeesValid = maxFees.trim() !== "" && !isNaN(maxFeesNum) && maxFeesNum > 0;

  // ── reset is at component level so all handlers can access it ──
  function reset() {
    setResult("");
    setDone(false);
    setError("");
    setRecommendError("");
    setRecommendations([]);
    setRank("");
    setMaxFees("");
    setPreference("");
  }

  function buildPrompt(): string {
    const stateInfo = homeState === "specific" && specificState
      ? `Target state: ${specificState}`
      : homeState === "home"
      ? "Student prefers colleges in their home state (state quota)"
      : "Open to colleges anywhere in India";

    return `You are an expert Indian college admissions counselor with deep knowledge of cutoffs, college rankings, and placement records.

A student needs college predictions based on their entrance exam performance.

**Exam:** ${exam}
**${isCat ? "Percentile" : "Rank"}:** ${rank}
**Category:** ${category}
${stateInfo}
${preference ? `**Student preference:** ${preference}` : ""}

Based on this, please provide:

1. **Admission Chances** — Briefly assess their chances (Safe / Moderate / Reach) for top colleges in this exam's domain.

2. **Top College Predictions** — List 5–7 specific colleges they have a realistic chance of getting into, with brief notes on why each fits their profile. Include approximate cutoff range for context.

3. **Reach Colleges** (1–2) — Slightly above their range but worth applying.

4. **Safe Colleges** (2–3) — Comfortable admits they should definitely apply to.

5. **Quick Advice** — One key tip specific to their situation (category benefits, state quota, branch choices, etc.).

Write in a warm, encouraging tone. Be specific with college names — do not be vague. Use simple formatting with bold headers. Keep it under 350 words.`;
  }

  async function fetchRecommendations() {
    const preferredLocation =
      homeState === "specific" && specificState.trim()
        ? specificState.trim()
        : undefined;

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rank: rankNum, maxFees: maxFeesNum, preferredLocation }),
      });
      const json = (await res.json()) as Recommendation[] | RecommendErrorResponse;

      if (!res.ok) {
        const err = json as RecommendErrorResponse;
        setRecommendError(err.error || "Failed to load recommendations");
        setRecommendations([]);
        return;
      }

      setRecommendations(Array.isArray(json) ? json : []);
      setRecommendError("");
    } catch {
      setRecommendError("Failed to load recommendations");
      setRecommendations([]);
    }
  }

  async function handlePredict() {
    if (!exam || !rankValid || !maxFeesValid) return;

    setLoading(true);
    setResult("");
    setRecommendations([]);
    setDone(false);
    setError("");
    setRecommendError("");

    // AI prediction
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: buildPrompt() }],
        }),
      });
      if (!res.ok) {
        setError("AI prediction failed.");
      } else {
        const json = await res.json() as { text?: string };
        setResult(json.text ?? "");
      }
    } catch {
      setError("AI prediction failed.");
    }

    // Recommendations
    await fetchRecommendations().catch(() => {
      setRecommendError("Failed to load recommendations.");
    });

    setDone(true);
    setLoading(false);
  }

  return (
    <main className="relative min-h-screen bg-[#070e1d] text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[700px] -translate-x-1/2 rounded-full bg-violet-700/8 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-cyan-700/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            AI-Powered
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">College Predictor</h1>
          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-white/35">
            Enter your exam rank and get personalised college predictions powered by AI.
          </p>
        </div>

        <div className="space-y-5">

          {/* Step 1 — Exam */}
          <div className="rounded-3xl border border-white/[0.07] bg-[#0c1526]/80 p-5 sm:p-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/30">Step 1</p>
            <p className="mb-4 text-sm font-semibold text-white/70">Which exam did you appear for?</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {EXAMS.map((e) => {
                const isActive = exam === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => { setExam(e.id); reset(); }}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition active:scale-95 ${
                      isActive ? `${e.border} ${e.bg} ${e.color}` : "border-white/[0.07] bg-white/[0.03] text-white/50 hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{e.icon}</span>
                    <div>
                      <p className="text-sm font-bold">{e.id}</p>
                      <p className="text-[10px] text-white/30 leading-tight">{e.hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 — Rank & details */}
          {exam && (
            <div className="rounded-3xl border border-white/[0.07] bg-[#0c1526]/80 p-5 sm:p-6 space-y-5">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/30">Step 2</p>
                <p className="mb-4 text-sm font-semibold text-white/70">Your details</p>
              </div>

              {/* Rank input */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/40">
                  {isCat ? "CAT Percentile" : `${exam} Rank`}
                </label>
                <div className="relative">
                  <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold ${examConfig?.color}`}>
                    {isCat ? "%" : "#"}
                  </span>
                  <input
                    type="number"
                    value={rank}
                    onChange={(e) => { setRank(e.target.value); if (done || error) reset(); }}
                    placeholder={examConfig?.placeholder}
                    className={`w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] py-3.5 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-white/20 focus:bg-white/[0.05] focus:ring-2 ${examConfig?.border.replace("border-", "ring-") ?? "ring-white/10"}`}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-white/25">{examConfig?.hint}</p>
              </div>

              {/* Max fees */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/40">
                  Max annual fees (₹)
                </label>
                <input
                  type="number"
                  value={maxFees}
                  onChange={(e) => { setMaxFees(e.target.value); if (done || error || recommendError) reset(); }}
                  placeholder="e.g. 200000"
                  className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-white/20 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/40">Category / Quota</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                        category === c ? "border-violet-500/40 bg-violet-500/15 text-violet-300" : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location preference */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/40">Location preference</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {HOME_STATE_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setHomeState(opt.value)}
                      className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left transition ${
                        homeState === opt.value ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:border-white/15 hover:text-white"
                      }`}>
                      <span>{opt.icon}</span>
                      <div>
                        <p className="text-xs font-bold">{opt.label}</p>
                        <p className="text-[10px] text-white/25">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {homeState === "specific" && (
                  <select
                    value={specificState}
                    onChange={(e) => setSpecificState(e.target.value)}
                    className="mt-2.5 w-full rounded-2xl border border-white/[0.07] bg-[#0c1526] px-4 py-3 text-sm text-white outline-none focus:border-white/20 focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="">Select state…</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>

              {/* Optional preference */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/40">
                  Preferred branch / course <span className="text-white/20">(optional)</span>
                </label>
                <input
                  type="text"
                  value={preference}
                  onChange={(e) => { setPreference(e.target.value); if (done || error) reset(); }}
                  placeholder="e.g. Computer Science, MBA Finance, MBBS…"
                  className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-white/20 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {/* Predict button */}
              <button
                onClick={handlePredict}
                disabled={!rankValid || !maxFeesValid || loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
              >
                {loading ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> Predicting colleges…</>
                ) : (
                  <><span>✨</span> Predict My Colleges</>
                )}
              </button>
            </div>
          )}

          {/* Result */}
          {(loading || result || error || recommendations.length > 0 || recommendError) && (
            <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c1526]">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] bg-gradient-to-r from-violet-500/10 to-cyan-500/5 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-lg">🎯</div>
                  <div>
                    <p className="text-sm font-bold text-white">Your College Predictions</p>
                    <p className="text-xs text-white/35">Based on {exam} {isCat ? "percentile" : "rank"} {rank} · {category}</p>
                  </div>
                </div>
                {done && (
                  <button onClick={reset} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/40 transition hover:text-white">
                    Reset
                  </button>
                )}
              </div>

              <div className="p-5 sm:p-6">
                {loading && recommendations.length === 0 && !recommendError && (
                  <div className="mb-5 flex items-center gap-3 text-white/40">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                    <span className="text-xs">Finding recommended colleges…</span>
                  </div>
                )}

                {recommendError && (
                  <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/6 px-4 py-3 text-sm text-rose-400">
                    {recommendError}
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">Top recommendations</p>
                    {recommendations.map((item, index) => (
                      <div key={item.collegeId} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              #{index + 1} · Match score {(item.score * 100).toFixed(0)}%
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-white/50">{item.explanation}</p>
                          </div>
                          <a href={`/colleges/${item.collegeId}`}
                            className="shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20">
                            View
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && !recommendError && recommendations.length === 0 && done && (
                  <div className="mb-5 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-6 text-center">
                    <p className="text-sm text-white/40">No colleges matched your budget and location filters.</p>
                  </div>
                )}

                {loading && !result && (
                  <div className="flex items-center gap-3 text-white/40">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                    <span className="text-xs">Analysing cutoffs and matching colleges…</span>
                  </div>
                )}

                {error && <p className="text-sm text-rose-400">{error}</p>}

                {result && (
                  <div className="prose-custom text-sm leading-relaxed text-white/75 space-y-3">
                    {result.split("\n").map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-1" />;
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i}>
                          {parts.map((part, j) =>
                            j % 2 === 1
                              ? <strong key={j} className="font-bold text-white">{part}</strong>
                              : <span key={j}>{part}</span>
                          )}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compare CTA */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/60">Found a few colleges?</p>
              <p className="text-xs text-white/25 mt-0.5">Compare them side-by-side with fees, ratings & placements</p>
            </div>
            <a href="/compare"
              className="shrink-0 flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-300 transition hover:bg-violet-500/20">
              Compare
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}