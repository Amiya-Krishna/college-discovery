"use client";

interface FilterValues {
  state?: string;
  rating?: string;
  minFees?: string;
  maxFees?: string;
}

interface FilterPanelProps {
  values: FilterValues;
  states?: string[];
  onChange: (next: FilterValues) => void;
  className?: string;
}

export default function FilterPanel({
  values,
  states = [],
  onChange,
  className = "",
}: FilterPanelProps) {
  const handle = (field: keyof FilterValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  const hasActiveFilters = Object.values(values).some(Boolean);

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* State */}
        <div className="group relative">
          <label className="mb-1.5 block text-xs font-medium text-slate-400">State</label>
          <div className="relative">
            <select
              value={values.state ?? ""}
              onChange={(e) => handle("state", e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-3.5 pr-9 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="" className="bg-[#0f1629]">All states</option>
              {states.map((s) => (
                <option key={s} value={s} className="bg-[#0f1629]">
                  {s}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Min Fees */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Min Fees (₹)</label>
          <input
            type="number"
            value={values.minFees ?? ""}
            onChange={(e) => handle("minFees", e.target.value)}
            placeholder="e.g. 20,000"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 px-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-indigo-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Max Fees */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Max Fees (₹)</label>
          <input
            type="number"
            value={values.maxFees ?? ""}
            onChange={(e) => handle("maxFees", e.target.value)}
            placeholder="e.g. 2,00,000"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 px-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-indigo-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Rating */}
        <div className="relative">
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Min Rating</label>
          <div className="relative">
            <select
              value={values.rating ?? ""}
              onChange={(e) => handle("rating", e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-3.5 pr-9 text-sm text-white outline-none transition-all focus:border-indigo-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="" className="bg-[#0f1629]">Any rating</option>
              <option value="1" className="bg-[#0f1629]">⭐ 1.0+</option>
              <option value="2" className="bg-[#0f1629]">⭐ 2.0+</option>
              <option value="3" className="bg-[#0f1629]">⭐ 3.0+</option>
              <option value="4" className="bg-[#0f1629]">⭐ 4.0+</option>
              <option value="4.5" className="bg-[#0f1629]">⭐ 4.5+</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => onChange({})}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}