"use client";

import Link from "next/link";

interface CollegeCardProps {
  id: string;
  name: string;
  state: string;
  fees: number | string;
  rating: number | string;
  averagePackage: number | string;
  city?: string;
  href?: string;
  isSaved?: boolean;
  saveLoading?: boolean;
  onToggleSave?: (id: string) => void;
  compareSelected?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (id: string) => void;
}

function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(Number(num))) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(num));
}

function RatingBadge({ rating }: { rating: number | string }) {
  const num = Number(rating);
  const color =
    num >= 4.5
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : num >= 3.5
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-rose-500/15 text-rose-400 border-rose-500/30";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {num.toFixed(1)}
    </span>
  );
}

export default function CollegeCard({
  id,
  name,
  state,
  city,
  fees,
  rating,
  averagePackage,
  href,
  isSaved = false,
  saveLoading = false,
  onToggleSave,
  compareSelected = false,
  compareDisabled = false,
  onToggleCompare,
}: CollegeCardProps) {
  const detailsHref = href ?? `/colleges/${id}`;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1629]/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)]">
      {/* Top shimmer on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-5 md:p-6">

        {/* ── Left: name + location ── */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-base font-semibold leading-tight text-white md:text-lg">{name}</h3>
            <RatingBadge rating={rating} />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-400">
            <svg className="h-3.5 w-3.5 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {city ? `${city}, ${state}` : state}
          </p>
        </div>

        {/* ── Right: stats + actions ── */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Fees */}
          <div className="rounded-xl bg-white/[0.05] px-4 py-2.5 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Fees</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{formatCurrency(fees)}</p>
          </div>

          {/* Avg Package */}
          <div className="rounded-xl bg-white/[0.05] px-4 py-2.5 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Avg Package</p>
            <p className="mt-0.5 text-sm font-semibold text-emerald-400">{formatCurrency(averagePackage)}</p>
          </div>

          {/* View Details */}
          <Link
            href={detailsHref}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            View Details
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          {/* Divider */}
          {(onToggleCompare || onToggleSave) && (
            <div className="hidden h-8 w-px bg-white/[0.07] md:block" />
          )}

          {/* Compare button */}
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(id)}
              disabled={compareDisabled && !compareSelected}
              title={compareSelected ? "Remove from compare" : "Add to compare"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40 ${
                compareSelected
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                  : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-violet-500/30 hover:text-violet-300"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </button>
          )}

          {/* Save button */}
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(id)}
              disabled={saveLoading}
              title={isSaved ? "Unsave college" : "Save college"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isSaved
                  ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                  : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-indigo-500/30 hover:text-indigo-300"
              }`}
            >
              {saveLoading ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border border-indigo-400/30 border-t-indigo-400" />
              ) : (
                <svg className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0115.186 0z" />
                </svg>
              )}
            </button>
          )}

        </div>
      </div>
    </article>
  );
}