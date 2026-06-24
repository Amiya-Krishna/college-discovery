"use client";

import { useEffect, useState } from "react";
import CollegeCard from "@/app/components/CollegeCard";

type SavedCollege = {
  id: string;
  name: string;
  state: string;
  city: string;
  fees: number | string;
  rating: number | string;
  averagePackage: number | string;
};

type SavedResponse = {
  success?: boolean;
  data?: SavedCollege[];
  error?: string;
};

export default function SavedPage() {
  const [items, setItems] = useState<SavedCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSavedColleges() {
      try {
        const response = await fetch("/api/saved-colleges", { signal: controller.signal });
        const json = (await response.json()) as SavedResponse;
        if (!response.ok) {
          if (response.status === 401) throw new Error("Please log in to view saved colleges.");
          throw new Error(json.error || "Failed to load saved colleges");
        }
        setItems(json.data ?? []);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load saved colleges");
      } finally {
        setLoading(false);
      }
    }

    loadSavedColleges();
    return () => controller.abort();
  }, []);

  const handleToggleSave = async (collegeId: string) => {
    setSavingId(collegeId);
    setError("");
    try {
      const response = await fetch(`/api/saved-colleges/${collegeId}`, { method: "DELETE" });
      const json = (await response.json()) as SavedResponse;
      if (!response.ok) throw new Error(json.error || "Failed to remove college");
      setItems((current) => current.filter((item) => item.id !== collegeId));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Failed to remove college");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute -top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/7 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">My Collection</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Saved Colleges</h1>
            <p className="mt-2 text-sm text-slate-500">Your personal college shortlist.</p>
          </div>
          {items.length > 0 && (
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              {items.length} saved
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.03]" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map((college) => (
              <CollegeCard
                key={college.id}
                {...college}
                isSaved
                saveLoading={savingId === college.id}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-20 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
              <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0115.186 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-400">Nothing saved yet</p>
            <p className="mt-1 text-xs text-slate-600">Browse colleges and save the ones that interest you.</p>
          </div>
        )}
      </div>
    </main>
  );
}
