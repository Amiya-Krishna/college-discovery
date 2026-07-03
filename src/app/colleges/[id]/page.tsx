"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  name: string;
  duration: string;
  fees: number | string;
};

type Review = {
  id: string;
  rating: number | string;
  comment: string;
};

type CollegeDetail = {
  id: string;
  name: string;
  overview: string;
  fees: number | string;
  rating: number | string;
  highestPackage: number | string;
  averagePackage: number | string;
  city: string;
  state: string;
  website: string;
  type: string;
  admissionProcess: string;
  courses: Course[];
  reviews: Review[];
};

type ApiResponse = {
  success?: boolean;
  data?: CollegeDetail;
  error?: string;
};

type SavedResponse = {
  success?: boolean;
  data?: { id: string }[];
  error?: string;
};

function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-indigo-500/30 bg-indigo-600/10" : "border-white/[0.08] bg-white/[0.04]"}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${accent ? "text-indigo-300" : "text-white"}`}>{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#0f1629] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-400/80">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StarRating({ rating }: { rating: number | string }) {
  const num = Math.round(Number(rating));
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < num ? "fill-amber-400 text-amber-400" : "fill-slate-700 text-slate-700"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Save Button ──────────────────────────────────────────────────────────────

function SaveButton({
  collegeId,
  isSaved,
  loading,
  error,
  onToggle,
}: {
  collegeId: string;
  isSaved: boolean;
  loading: boolean;
  error: string;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => onToggle(collegeId)}
        disabled={loading}
        aria-label={isSaved ? "Remove from saved" : "Save college"}
        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
          isSaved
            ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/20 hover:text-amber-300"
            : "border-white/10 bg-white/[0.05] text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300"
        }`}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            fill={isSaved ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        )}
        {isSaved ? "Saved" : "Save"}
      </button>
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CollegeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(() => Boolean(id));
  const [error, setError] = useState(() => (id ? "" : "Missing college id"));

  // Save state
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Load college detail
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function loadCollege() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/colleges/${id}`, { signal: controller.signal });
        const json = (await response.json()) as ApiResponse;
        if (!response.ok) throw new Error(json.error || "Failed to load college details");
        setCollege(json.data ?? null);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setCollege(null);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load college details");
      } finally {
        setLoading(false);
      }
    }

    loadCollege();
    return () => controller.abort();
  }, [id]);

  // Check if already saved
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function checkSaved() {
      try {
        const res = await fetch("/api/saved-colleges", { signal: controller.signal });
        const json = (await res.json()) as SavedResponse;
        if (!res.ok) return;
        const savedSet = new Set((json.data ?? []).map((item) => item.id));
        setIsSaved(savedSet.has(id));
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }

    checkSaved();
    return () => controller.abort();
  }, [id]);

  // Toggle save
  const handleToggleSave = async (collegeId: string) => {
    setSaveLoading(true);
    setSaveError("");
    try {
      if (isSaved) {
        const res = await fetch(`/api/saved-colleges/${collegeId}`, { method: "DELETE" });
        const json = (await res.json()) as SavedResponse;
        if (!res.ok) {
          if (res.status === 401) throw new Error("Please log in to manage saved colleges.");
          throw new Error(json.error || "Failed to unsave college");
        }
        setIsSaved(false);
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
        setIsSaved(true);
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to update saved college");
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-52 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
            <div className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-rose-400">Unable to load college details</p>
          <p className="mt-2 text-sm text-rose-500/80">{error}</p>
        </div>
      </main>
    );
  }

  if (!college) return null;

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute -top-10 left-1/4 h-[400px] w-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">

        {/* Hero card */}
        <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0f1629]">

          {/* Header — name + location + SAVE BUTTON */}
          <div className="relative border-b border-white/[0.07] px-6 py-8 sm:px-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">College Profile</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{college.name}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
                  <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {college.city}, {college.state}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-300">
                    {college.type}
                  </span>
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 transition hover:border-indigo-500/60 hover:bg-indigo-500/20"
                  >
                    Official Website
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* ── Save button ── */}
              <SaveButton
                collegeId={college.id}
                isSaved={isSaved}
                loading={saveLoading}
                error={saveError}
                onToggle={handleToggleSave}
              />
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
            <StatCard label="Annual Fees" value={formatCurrency(college.fees)} />
            <StatCard label="Rating" value={`${Number(college.rating).toFixed(1)} / 5`} accent />
            <StatCard label="Highest Package" value={formatCurrency(college.highestPackage)} />
            <StatCard label="Average Package" value={formatCurrency(college.averagePackage)} />
          </div>

          {/* Overview + Quick Facts */}
          <div className="grid gap-6 border-t border-white/[0.07] px-6 py-6 sm:px-8 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="text-base font-semibold text-white">Overview</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{college.overview}</p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold text-white">Quick Facts</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  { label: "Location", value: `${college.city}, ${college.state}` },
                  { label: "Type", value: college.type },
                  { label: "Admission Process", value: college.admissionProcess },
                  { label: "Fees", value: formatCurrency(college.fees) },
                  { label: "Rating", value: Number(college.rating).toFixed(1) },
                  { label: "Avg Package", value: formatCurrency(college.averagePackage) },
                  { label: "Top Package", value: formatCurrency(college.highestPackage) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-medium text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="grid gap-4 border-t border-white/[0.07] px-6 py-6 sm:px-8 lg:grid-cols-3">
            <SectionCard eyebrow="Admissions" title="How to Apply">
              <div className="space-y-3 text-sm leading-6 text-slate-300">
                <p>{college.admissionProcess}</p>
                <p className="text-slate-400">
                  Always verify the application window, entrance-exam requirements, counselling steps, and document list on the official website before applying.
                </p>
              </div>
            </SectionCard>

            <SectionCard eyebrow="Decision Guide" title="What to Compare">
              <ul className="space-y-2 text-sm leading-6 text-slate-300">
                <li>Placement record for your branch or program.</li>
                <li>Total fees, hostel cost, and scholarship options.</li>
                <li>Location, commute, campus culture, and internship access.</li>
                <li>Accreditation, faculty strength, and alumni network.</li>
              </ul>
            </SectionCard>

            <SectionCard eyebrow="Official Site" title="Useful Links">
              <div className="space-y-3 text-sm leading-6 text-slate-300">
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 transition hover:border-indigo-500/60 hover:bg-indigo-500/20"
                >
                  Open official college website
                </a>
                <p className="text-slate-400">
                  Use the admissions portal for brochure downloads, fee notices, cutoffs, and course-specific eligibility rules.
                </p>
              </div>
            </SectionCard>
          </div>
        </section>

        {/* Courses & Reviews */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* Courses */}
          <section className="rounded-2xl border border-white/[0.07] bg-[#0f1629] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-white">Courses Offered</h2>
              <span className="rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                {college.courses.length} courses
              </span>
            </div>
            <div className="space-y-3">
              {college.courses.length > 0 ? (
                college.courses.map((course) => (
                  <article key={course.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:border-indigo-500/30">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{course.name}</h3>
                        <p className="mt-0.5 text-xs text-slate-500">{course.duration}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                        {formatCurrency(course.fees)}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-slate-600">No courses listed.</p>
              )}
            </div>
          </section>

          {/* Reviews */}
          <section className="rounded-2xl border border-white/[0.07] bg-[#0f1629] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-white">Student Reviews</h2>
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                {college.reviews.length} reviews
              </span>
            </div>
            <div className="space-y-3">
              {college.reviews.length > 0 ? (
                college.reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <StarRating rating={review.rating} />
                      <span className="text-xs font-semibold text-slate-400">{Number(review.rating).toFixed(1)} / 5</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{review.comment}</p>
                  </article>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-slate-600">No reviews yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}