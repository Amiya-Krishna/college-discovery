"use client";

import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  className = "",
}: SearchBarProps) {
  const [local, setLocal] = useState(value ?? "");
  const timer = useRef<number | null>(null);
  // Store onChange in a ref so it never triggers the debounce effect
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  // Only re-run when `local` or `debounceMs` changes — NOT when onChange changes
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      onChangeRef.current(local);
    }, debounceMs);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [local, debounceMs]); // ← onChange intentionally removed

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          type="search"
          placeholder={placeholder}
          className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.05] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/70 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/20"
        />
        {local && (
          <button
            type="button"
            onClick={() => { setLocal(""); onChangeRef.current(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}