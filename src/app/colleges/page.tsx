"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import CollegeCard from "@/app/components/CollegeCard";
import FilterPanel from "@/app/components/FilterPanel";
import SearchBar from "@/app/components/SearchBar";
import { usePageState } from "@/lib/usePageState";

type College = {
  id: string;
  name: string;
  state: string;
  city: string;
  fees: number | string;
  rating: number | string;
  averagePackage: number | string;
};

type ApiResponse = {
  data: College[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
};

type FilterValues = {
  state?: string;
  rating?: string;
  minFees?: string;
  maxFees?: string;
};

type PageState = {
  query: string;
  filters: FilterValues;
  page: number;
};

type SavedResponse = {
  success?: boolean;
  data?: { id: string }[];
  error?: string;
};

const DEFAULT_LIMIT = 8;
const STATES = [
  "Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Telangana",
  "Uttar Pradesh", "West Bengal", "Gujarat", "Rajasthan", "Punjab",
];

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const windowSize = 5;
    const start = Math.max(1, page - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    const adjustedStart = Math.max(1, end - windowSize + 1);
    return Array.from({ length: Math.max(0, end - adjustedStart + 1) }, (_, i) => adjustedStart + i);
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Prev
      </button>

      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`min-w-[40px] rounded-xl px-4 py-2 text-sm font-semibold transition ${
            item === page
              ? "bg-indigo-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.4)]"
              : "border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function CollegesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Persisted page state (restored on back-navigation) ──
  const [pageState, setPageState] = usePageState<PageState>("colleges", {
    query: searchParams.get("q") ?? "",
    filters: {
      state: searchParams.get("state") ?? undefined,
      rating: searchParams.get("rating") ?? undefined,
      minFees: searchParams.get("minFees") ?? undefined,
      maxFees: searchParams.get("maxFees") ?? undefined,
    },
    page: Math.max(1, Number(searchParams.get("page") ?? "1")),
  });

  const { query, filters, page } = pageState;

  // ── Remote data ──
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  // ── Sync state → URL ──
  function pushToUrl(next: PageState) {
    const params = new URLSearchParams();
    if (next.page > 1) params.set("page", String(next.page));
    if (next.query.trim()) params.set("q", next.query.trim());
    if (next.filters.state) params.set("state", next.filters.state);
    if (next.filters.rating) params.set("rating", next.filters.rating);
    if (next.filters.minFees) params.set("minFees", next.filters.minFees);
    if (next.filters.maxFees) params.set("maxFees", next.filters.maxFees);
    const qs = params.toString();
    router.replace(qs ? `/colleges?${qs}` : "/colleges", { scroll: false });
  }

  // ── Handlers ──
  const handleQueryChange = useCallback((next: string) => {
    const updated: PageState = { query: next, filters, page: 1 };
    setPageState(updated);
    pushToUrl(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function handleFiltersChange(next: FilterValues) {
    const updated: PageState = { query, filters: next, page: 1 };
    setPageState(updated);
    pushToUrl(updated);
  }

  function handlePageChange(nextPage: number) {
    if (nextPage === page) return;
    const updated: PageState = { query, filters, page: nextPage };
    setPageState(updated);
    pushToUrl(updated);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── API params ──
  const queryParams = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      limit: String(DEFAULT_LIMIT),
    };
    if (query.trim()) p.name = query.trim();
    if (filters.state) p.state = filters.state;
    if (filters.rating) p.rating = filters.rating;
    if (filters.minFees) p.minFees = filters.minFees;
    if (filters.maxFees) p.maxFees = filters.maxFees;
    return p;
  }, [filters, page, query]);

  // ── Load saved colleges ──
  useEffect(() => {
    const controller = new AbortController();
    async function loadSaved() {
      try {
        const res = await fetch("/api/saved-colleges", { signal: controller.signal });
        const json = (await res.json()) as SavedResponse;
        if (!res.ok) return;
        setSavedIds(new Set((json.data ?? []).map((item) => item.id)));
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    loadSaved();
    return () => controller.abort();
  }, []);

  // ── Load colleges ──
  useEffect(() => {
    const controller = new AbortController();
    async function loadColleges() {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get<ApiResponse>("/api/colleges", {
          params: queryParams,
          signal: controller.signal,
        });
        setData(response.data.data ?? []);
        setTotal(response.data.total ?? 0);
        setTotalPages(response.data.totalPages ?? 1);
      } catch (err) {
        if (axios.isCancel(err) || (err instanceof DOMException && err.name === "AbortError")) return;
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || "Failed to load colleges");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load colleges");
      } finally {
        setLoading(false);
      }
    }
    loadColleges();
    return () => controller.abort();
  }, [queryParams]);

  // ── Save / unsave ──
  const handleToggleSave = async (collegeId: string) => {
    setSavingId(collegeId);
    setSaveError("");
    const isSaved = savedIds.has(collegeId);
    try {
      if (isSaved) {
        const res = await fetch(`/api/saved-colleges/${collegeId}`, { method: "DELETE" });
        const json = (await res.json()) as SavedResponse;
        if (!res.ok) {
          if (res.status === 401) throw new Error("Please log in to manage saved colleges.");
          throw new Error(json.error || "Failed to unsave college");
        }
        setSavedIds((cur) => { const next = new Set(cur); next.delete(collegeId); return next; });
      } else {
        const res = await fetch("/api/saved-colleges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId }),
        });
        const json = (await res.json()) as SavedResponse;
        if (!res.ok) {
          if (res.status === 401) throw new Error("Please log in to save colleges.");
          throw new Error(json.error || "Failed to save college");
        }
        setSavedIds((cur) => new Set(cur).add(collegeId));
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to update saved college");
    } finally {
      setSavingId(null);
    }
  };

  // ── Compare ──
  const handleToggleCompare = (collegeId: string) => {
    setCompareIds((cur) => {
      if (cur.includes(collegeId)) return cur.filter((id) => id !== collegeId);
      if (cur.length >= 3) return cur;
      return [...cur, collegeId];
    });
  };

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-indigo-600/6 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Explore</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Browse Colleges</h1>
          <p className="mt-2 text-sm text-slate-500">Search by name, filter by state, fees, or rating.</p>
        </div>

        <div className="mb-6 space-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
          <SearchBar
            value={query}
            onChange={handleQueryChange}
            placeholder="Search colleges by name..."
            debounceMs={300}
          />
          <FilterPanel
            values={filters}
            states={STATES}
            onChange={handleFiltersChange}
          />
        </div>

        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span>{total} colleges found</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        {(error || saveError) && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error || saveError}
          </div>
        )}

        {compareIds.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
            <p className="text-sm text-violet-300">
              {compareIds.length} college{compareIds.length !== 1 ? "s" : ""} selected for compare (max 3)
            </p>
            <a
              href={compareIds.length >= 2 ? `/compare?ids=${compareIds.join(",")}` : "#"}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                compareIds.length >= 2
                  ? "bg-violet-600 text-white hover:bg-violet-500"
                  : "cursor-not-allowed bg-white/[0.06] text-white/30"
              }`}
            >
              Compare selected
            </a>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.03]" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        ) : data.length > 0 ? (
          <div className="space-y-3">
            {data.map((college) => (
              <CollegeCard
                key={college.id}
                {...college}
                isSaved={savedIds.has(college.id)}
                saveLoading={savingId === college.id}
                onToggleSave={handleToggleSave}
                compareSelected={compareIds.includes(college.id)}
                compareDisabled={compareIds.length >= 3}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-sm font-semibold text-slate-400">No colleges match your filters</p>
            <p className="mt-1 text-xs text-slate-600">Try adjusting your search or clearing filters.</p>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>
    </main>
  );
}

import { Suspense } from "react";

export default function CollegesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CollegesContent />
    </Suspense>
  );
}