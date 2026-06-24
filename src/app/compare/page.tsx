"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ComparisonCollege = {
  id: string;
  name: string;
  fees: number;
  rating: number;
  highestPackage: number;
  averagePackage: number;
  city: string;
  state: string;
};

type SearchResult = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type CompareResponse = {
  colleges?: ComparisonCollege[];
  comparison?: {
    fees: { values: number[]; best: number | null };
    placement: { values: number[]; best: number | null };
    rating: { values: number[]; best: number | null };
    location: { values: string[] };
  };
  error?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(value: number) {
  if (!value && value !== 0) return "N/A";
  if (value >= 100_000)
    return `₹${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 1)}L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Metric config ─────────────────────────────────────────────────────────────

type MetricKey = keyof Pick<
  ComparisonCollege,
  "fees" | "rating" | "highestPackage" | "averagePackage"
>;

type MetricConfig = {
  label: string;
  sublabel?: string;
  key: MetricKey;
  icon: string;
  winDir: "high" | "low" | null;
  format: (v: number) => string;
};

const METRICS: MetricConfig[] = [
  { label: "Annual Fees", sublabel: "Tuition & hostel", key: "fees", icon: "💸", winDir: "low", format: formatINR },
  { label: "Rating", sublabel: "Overall score / 5", key: "rating", icon: "⭐", winDir: "high", format: (v) => `${Number(v).toFixed(1)} / 5` },
  { label: "Highest Package", sublabel: "Best CTC offered", key: "highestPackage", icon: "🚀", winDir: "high", format: formatINR },
  { label: "Average Package", sublabel: "Median CTC offered", key: "averagePackage", icon: "📊", winDir: "high", format: formatINR },
];

// ─── Accents ──────────────────────────────────────────────────────────────────

const ACCENTS = [
  { text: "text-violet-400", dot: "bg-violet-500", ring: "ring-violet-500/30", badge: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30", bar: "bg-violet-500", barBg: "bg-violet-500/15", border: "border-violet-500/30", headerBg: "bg-violet-500/10" },
  { text: "text-cyan-400", dot: "bg-cyan-500", ring: "ring-cyan-500/30", badge: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30", bar: "bg-cyan-500", barBg: "bg-cyan-500/15", border: "border-cyan-500/30", headerBg: "bg-cyan-500/10" },
  { text: "text-amber-400", dot: "bg-amber-500", ring: "ring-amber-500/30", badge: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30", bar: "bg-amber-500", barBg: "bg-amber-500/15", border: "border-amber-500/30", headerBg: "bg-amber-500/10" },
];

// ─── Save Button ──────────────────────────────────────────────────────────────

function SaveButton({ collegeId, accentIndex }: { collegeId: string; accentIndex: number }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const accent = ACCENTS[accentIndex];

  async function handleSave() {
    if (saved || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/saved-colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId }),
      });
      const json = await res.json() as { success?: boolean; error?: string };
      if (res.status === 409) {
        // Already saved
        setSaved(true);
        return;
      }
      if (!res.ok) {
        if (res.status === 401) {
          setError("Login karein");
        } else {
          setError(json.error ?? "Error");
        }
        return;
      }
      setSaved(true);
    } catch {
      setError("Failed");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <button
        onClick={handleSave}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] font-semibold text-rose-400 transition hover:bg-rose-500/20"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        {error} — Retry
      </button>
    );
  }

  if (saved) {
    return (
      <div className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border ${accent.border} ${accent.headerBg} px-3 py-2 text-[11px] font-semibold ${accent.text}`}>
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" />
        </svg>
        Saved
      </div>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-white/40 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
    >
      {loading ? (
        <div className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-white/60" />
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      )}
      {loading ? "Saving…" : "Save College"}
    </button>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricBar({ value, max, accentIndex }: { value: number; max: number; accentIndex: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`mt-2 h-1.5 w-full rounded-full ${ACCENTS[accentIndex].barBg}`}>
      <div className={`h-full rounded-full ${ACCENTS[accentIndex].bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  const pct = Math.round((value / 5) * 100);
  return (
    <span className="relative inline-block text-lg leading-none">
      <span className="text-white/10">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden text-amber-400" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}

function WinnerBadge({ accentIndex }: { accentIndex: number }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${ACCENTS[accentIndex].badge}`}>
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      BEST
    </span>
  );
}

// ─── College Search Input ──────────────────────────────────────────────────────

function CollegeSearchInput({ index, selected, disabledIds, onSelect, onRemove }: {
  index: number; selected: SearchResult | null; disabledIds: string[];
  onSelect: (r: SearchResult) => void; onRemove: () => void;
}) {
  const accent = ACCENTS[index];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const labels = ["College A", "College B", "College C"];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/colleges/search?name=${encodeURIComponent(query)}&limit=50`);
        const json = (await res.json()) as { data?: SearchResult[] };
        setResults(json.data ?? []);
        setOpen(true);
      } catch { setResults([]); } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  if (selected) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl border ${accent.border} bg-white/[0.03] px-4 py-3.5 ring-1 ${accent.ring}`}>
        <div className={`h-3 w-3 shrink-0 rounded-full ${accent.dot}`} />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-bold ${accent.text}`}>{selected.name}</p>
          <p className="mt-0.5 truncate text-xs text-white/30">📍 {selected.city}, {selected.state}</p>
        </div>
        <button onClick={onRemove} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/30 transition hover:bg-white/10 hover:text-white">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold ${accent.text} opacity-70`}>{labels[index]}</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search college name…"
          className={`w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] py-3.5 pl-24 pr-10 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.05] focus:ring-2 ${accent.ring}`} />
        {loading && (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
          </div>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1629] shadow-2xl shadow-black/70">
          {results.map((r) => {
            const isDisabled = disabledIds.includes(r.id);
            return (
              <button key={r.id} disabled={isDisabled}
                onClick={() => { if (isDisabled) return; onSelect(r); setQuery(""); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${isDisabled ? "cursor-not-allowed opacity-30" : "hover:bg-white/[0.06]"}`}>
                <div className={`h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isDisabled ? "text-white/30" : "text-white"}`}>{r.name}</p>
                  <p className="text-xs text-white/25">{r.city}, {r.state}</p>
                </div>
                {isDisabled && <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/30">Added</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Metric Card ───────────────────────────────────────────────────────

function MobileMetricCard({ metric, data, winnerIdx }: { metric: MetricConfig; data: ComparisonCollege[]; winnerIdx: number | null }) {
  const maxVal = Math.max(...data.map((c) => c[metric.key]));
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1525]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] bg-white/[0.025] px-4 py-3">
        <span className="text-lg">{metric.icon}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">{metric.label}</p>
          {metric.sublabel && <p className="text-[10px] text-white/25">{metric.sublabel}</p>}
        </div>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {data.map((c, i) => {
          const isWinner = winnerIdx === i;
          const accent = ACCENTS[i];
          return (
            <div key={c.id} className={`px-4 py-4 ${isWinner ? accent.headerBg : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />
                  <p className={`truncate text-xs font-semibold ${accent.text}`}>{c.name.length > 22 ? c.name.slice(0, 20) + "…" : c.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {metric.key === "rating" && <StarRating value={c[metric.key]} />}
                  {isWinner && <WinnerBadge accentIndex={i} />}
                </div>
              </div>
              <p className={`mt-1.5 text-base font-bold ${accent.text}`}>{metric.format(c[metric.key])}</p>
              <MetricBar value={c[metric.key]} max={maxVal} accentIndex={i} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AI Suggestion Panel ──────────────────────────────────────────────────────

type Priority = "fees" | "placement" | "rating" | "balanced";

const PRIORITY_OPTIONS: { value: Priority; label: string; icon: string; desc: string }[] = [
  { value: "fees", label: "Low Fees", icon: "💸", desc: "Budget is my top concern" },
  { value: "placement", label: "Best Placement", icon: "🚀", desc: "Highest salary matters most" },
  { value: "rating", label: "Top Rated", icon: "⭐", desc: "Overall college quality" },
  { value: "balanced", label: "Balanced", icon: "⚖️", desc: "Best all-round choice" },
];

function AISuggestionPanel({ colleges }: { colleges: ComparisonCollege[] }) {
  const [priority, setPriority] = useState<Priority | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function fetchSuggestion(p: Priority) {
    setPriority(p);
    setLoading(true);
    setSuggestion("");
    setDone(false);

    const collegeText = colleges
      .map((c, i) => `College ${i + 1}: ${c.name} | City: ${c.city}, ${c.state} | Fees: ₹${(c.fees / 100000).toFixed(1)}L/yr | Rating: ${c.rating}/5 | Avg Package: ₹${(c.averagePackage / 100000).toFixed(1)}L | Highest Package: ₹${(c.highestPackage / 100000).toFixed(1)}L`)
      .join("\n");

    const priorityLabel = PRIORITY_OPTIONS.find((o) => o.value === p)?.label ?? p;

    const prompt = `You are a friendly Indian college counselor helping a student choose between colleges.

The student's top priority is: **${priorityLabel}**

Here are the colleges being compared:
${collegeText}

Give a concise, warm, and helpful recommendation in 3–4 sentences. 
- Start by naming which college you recommend and why, based on the student's priority.
- Briefly mention one trade-off or thing to keep in mind.
- End with an encouraging note.
- Use simple English. Do NOT use bullet points or headers — write in natural flowing paragraphs.
- Be specific with numbers where relevant.`;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.ok) throw new Error("API error");
      const json = await res.json() as { text?: string };
      setSuggestion(json.text ?? "No suggestion available.");
      setDone(true);
    } catch {
      setSuggestion("Could not load suggestion. Please try again.");
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c1526]">
      <div className="flex items-center gap-3 border-b border-white/[0.07] bg-gradient-to-r from-violet-500/10 to-cyan-500/5 px-5 py-4 sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-lg">✨</div>
        <div>
          <p className="text-sm font-bold text-white">AI Recommendation</p>
          <p className="text-xs text-white/35">What matters most to you?</p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {PRIORITY_OPTIONS.map((opt) => {
            const isActive = priority === opt.value;
            return (
              <button key={opt.value} onClick={() => fetchSuggestion(opt.value)} disabled={loading}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-center transition active:scale-95 disabled:opacity-50 ${
                  isActive ? "border-violet-500/40 bg-violet-500/15 text-violet-300" : "border-white/[0.07] bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }`}>
                <span className="text-xl">{opt.icon}</span>
                <span className="text-xs font-bold">{opt.label}</span>
                <span className="text-[10px] text-white/30 leading-tight">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        {(loading || suggestion) && (
          <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
            {loading && !suggestion && (
              <div className="flex items-center gap-3 text-white/40">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
                <span className="text-xs">Analysing colleges…</span>
              </div>
            )}
            {suggestion && (
              <p className="text-sm leading-relaxed text-white/80">
                {suggestion}
                {!done && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-violet-400 align-middle" />}
              </p>
            )}
          </div>
        )}

        {!loading && !suggestion && (
          <p className="mt-4 text-center text-xs text-white/20">Tap a priority above to get your personalised recommendation</p>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [slots, setSlots] = useState<(SearchResult | null)[]>([null, null, null]);
  const [showThird, setShowThird] = useState(false);
  const [data, setData] = useState<ComparisonCollege[]>([]);
  const [comparison, setComparison] = useState<CompareResponse["comparison"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);

  const selectedIds = slots.filter((s): s is SearchResult => s !== null).map((s) => s.id);
  const filled = slots.filter((s): s is SearchResult => s !== null);
  const uniqueFilled = Array.from(new Map(filled.map((c) => [c.id, c])).values());
  const canCompare = uniqueFilled.length >= 2;

  useEffect(() => {
    if (initializedFromUrl) return;
    const params = new URLSearchParams(window.location.search);
    const idsParam = params.get("ids") ?? params.get("id");
    if (!idsParam) { setInitializedFromUrl(true); return; }

    const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 3);
    if (ids.length === 0) { setInitializedFromUrl(true); return; }

    async function preloadFromUrl() {
      try {
        const res = await fetch(`/api/compare?ids=${ids.join(",")}`);
        const json = (await res.json()) as CompareResponse;
        if (!res.ok || !json.colleges?.length) { setInitializedFromUrl(true); return; }

        const nextSlots: (SearchResult | null)[] = [null, null, null];
        json.colleges.forEach((college, index) => {
          nextSlots[index] = { id: college.id, name: college.name, city: college.city, state: college.state };
        });

        setSlots(nextSlots);
        setShowThird(ids.length > 2);
        setData(json.colleges);
        setComparison(json.comparison ?? null);
      } catch { /* ignore */ } finally { setInitializedFromUrl(true); }
    }

    preloadFromUrl();
  }, [initializedFromUrl]);

  function updateSlot(index: number, value: SearchResult | null) {
    setSlots((prev) => { const next = [...prev]; next[index] = value; return next; });
    setData([]); setComparison(null); setError("");
  }

  async function handleCompare() {
    if (!canCompare) return;
    setLoading(true); setError(""); setData([]); setComparison(null);
    try {
      const ids = uniqueFilled.map((c) => c.id).join(",");
      const res = await fetch(`/api/compare?ids=${ids}`);
      const json = (await res.json()) as CompareResponse;
      if (!res.ok) throw new Error(json.error || "Failed to load data");
      setData(json.colleges ?? []);
      setComparison(json.comparison ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  function winnerIndex(metric: MetricConfig): number | null {
    if (!metric.winDir || data.length < 2) return null;
    if (comparison) {
      if (metric.key === "fees") return comparison.fees.best;
      if (metric.key === "highestPackage") return comparison.placement.best;
      if (metric.key === "rating") return comparison.rating.best;
    }
    const values = data.map((c) => c[metric.key]);
    const best = metric.winDir === "high" ? Math.max(...values) : Math.min(...values);
    const winners = values.reduce<number[]>((acc, v, i) => (v === best ? [...acc, i] : acc), []);
    return winners.length === 1 ? winners[0] : null;
  }

  return (
    <main className="relative min-h-screen bg-[#070e1d] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-700/8 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-cyan-700/6 blur-[120px]" />
        <div className="absolute left-0 top-1/2 h-[300px] w-[300px] rounded-full bg-amber-700/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Side-by-side
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Compare Colleges</h1>
          <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-white/35 sm:max-w-md">
            Search 2–3 colleges and compare fees, placements, and ratings — then get an AI recommendation.
          </p>
        </div>

        {/* Search panel */}
        <section className="rounded-3xl border border-white/[0.07] bg-[#0c1526]/80 p-5 shadow-2xl shadow-black/40 sm:p-7">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">Select colleges</p>
          <div className="space-y-3">
            {([0, 1] as const).map((i) => (
              <CollegeSearchInput key={i} index={i} selected={slots[i]}
                disabledIds={selectedIds.filter((id) => slots[i] === null || id !== slots[i]?.id)}
                onSelect={(r) => updateSlot(i, r)} onRemove={() => updateSlot(i, null)} />
            ))}
            {!showThird ? (
              <button onClick={() => setShowThird(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.08] py-3 text-xs font-medium text-white/25 transition hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add a third college (optional)
              </button>
            ) : (
              <CollegeSearchInput index={2} selected={slots[2]}
                disabledIds={selectedIds.filter((id) => slots[2] === null || id !== slots[2]?.id)}
                onSelect={(r) => updateSlot(2, r)} onRemove={() => { updateSlot(2, null); setShowThird(false); }} />
            )}
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs text-white/25">
              {uniqueFilled.length < 2 ? `Choose ${2 - uniqueFilled.length} more to compare` : `${uniqueFilled.length} colleges selected`}
            </p>
            <button onClick={handleCompare} disabled={!canCompare || loading}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40">
              {loading ? (<><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />Loading…</>) : (<>Compare <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>)}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/6 px-4 py-3.5 text-sm text-rose-400">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Results */}
        {data.length > 0 && (
          <section className="mt-6 space-y-5">

            {/* College header cards — save button added here */}
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
              {data.map((c, i) => (
                <div key={c.id} className={`rounded-2xl border ${ACCENTS[i].border} ${ACCENTS[i].headerBg} p-4 ring-1 ${ACCENTS[i].ring}`}>
                  <div className={`mb-2 h-2 w-2 rounded-full ${ACCENTS[i].dot}`} />
                  <h3 className={`text-sm font-extrabold leading-snug ${ACCENTS[i].text}`}>{c.name}</h3>
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-white/30">
                    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {c.city}, {c.state}
                  </p>
                  <SaveButton collegeId={c.id} accentIndex={i} />
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c1526] md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                    <th className="w-48 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-white/25">Metric</th>
                    {data.map((c, i) => (
                      <th key={c.id} className="px-6 py-4 text-left">
                        <span className={`flex items-center gap-2 text-sm font-bold ${ACCENTS[i].text}`}>
                          <span className={`h-2 w-2 rounded-full ${ACCENTS[i].dot}`} />{c.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRICS.map((m) => {
                    const winner = winnerIndex(m);
                    const maxVal = Math.max(...data.map((c) => c[m.key]));
                    return (
                      <tr key={m.key} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{m.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-white/60">{m.label}</p>
                              {m.sublabel && <p className="text-[10px] text-white/25">{m.sublabel}</p>}
                            </div>
                          </div>
                        </td>
                        {data.map((c, i) => {
                          const isWinner = winner === i;
                          return (
                            <td key={c.id} className={`px-6 py-5 ${isWinner ? ACCENTS[i].headerBg : ""}`}>
                              <div className="flex flex-wrap items-center gap-2">
                                {m.key === "rating" && <StarRating value={c[m.key]} />}
                                <span className={`text-sm font-bold ${ACCENTS[i].text}`}>{m.format(c[m.key])}</span>
                                {isWinner && <WinnerBadge accentIndex={i} />}
                              </div>
                              <MetricBar value={c[m.key]} max={maxVal} accentIndex={i} />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {METRICS.map((m) => (
                <MobileMetricCard key={m.key} metric={m} data={data} winnerIdx={winnerIndex(m)} />
              ))}
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/25 mb-3">Summary</p>
              <div className="flex flex-wrap gap-2">
                {data.map((c, i) => {
                  const wins = METRICS.filter((m) => winnerIndex(m) === i).length;
                  return (
                    <div key={c.id} className={`flex items-center gap-2 rounded-xl border ${ACCENTS[i].border} ${ACCENTS[i].headerBg} px-3 py-2`}>
                      <div className={`h-2 w-2 rounded-full ${ACCENTS[i].dot}`} />
                      <span className={`text-xs font-semibold ${ACCENTS[i].text}`}>{c.name.split(" ").slice(0, 3).join(" ")}</span>
                      <span className="text-xs text-white/30">{wins} win{wins !== 1 ? "s" : ""}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Suggestion */}
            <AISuggestionPanel colleges={data} />

          </section>
        )}

        {/* Empty state */}
        {!loading && data.length === 0 && !error && (
          <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-white/[0.07] bg-white/[0.015] px-6 py-16 text-center sm:py-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-3xl">🎓</div>
            <p className="text-sm font-bold text-white/40">Pick colleges above to start comparing</p>
            <p className="mt-1.5 text-xs text-white/20">Fees · Placements · Ratings · Location — side by side</p>
          </div>
        )}

      </div>
    </main>
  );
}