"use client";

type CollegeCompare = {
  name: string;
  fees: number | string;
  rating: number | string;
  highestPackage: number | string;
  averagePackage: number | string;
  city?: string;
  state?: string;
};

interface CompareTableProps {
  items: CollegeCompare[];
  className?: string;
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

const rows: { label: string; key: keyof CollegeCompare; format?: (v: number | string) => string }[] = [
  { label: "Annual Fees", key: "fees", format: formatCurrency },
  { label: "Rating", key: "rating", format: (v) => `${Number(v).toFixed(1)} / 5` },
  { label: "Highest Package", key: "highestPackage", format: formatCurrency },
  { label: "Avg Package", key: "averagePackage", format: formatCurrency },
];

export default function CompareTable({ items, className = "" }: CompareTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-500 ${className}`}>
        No colleges to compare.
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      {/* Desktop table */}
      <table className="hidden w-full border-collapse text-left md:table">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Metric</th>
            {items.map((c) => (
              <th key={c.name} className="px-5 py-4 text-sm font-semibold text-white">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  {c.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, key, format }) => (
            <tr key={key} className="border-b border-white/[0.05] transition hover:bg-white/[0.02]">
              <td className="px-5 py-4 text-sm font-medium text-slate-400">{label}</td>
              {items.map((c) => {
                const raw = c[key] as number | string;
                return (
                  <td key={c.name} className="px-5 py-4 text-sm font-semibold text-white">
                    {format ? format(raw) : String(raw)}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="transition hover:bg-white/[0.02]">
            <td className="px-5 py-4 text-sm font-medium text-slate-400">Location</td>
            {items.map((c) => (
              <td key={c.name} className="px-5 py-4 text-sm font-semibold text-white">
                {c.city ? `${c.city}, ${c.state ?? ""}` : c.state}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Mobile stacked */}
      <div className="space-y-4 md:hidden">
        {items.map((c, idx) => (
          <div key={c.name} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <h4 className="text-sm font-semibold text-white">{c.name}</h4>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/[0.05] text-sm">
              {rows.map(({ label, key, format }) => {
                const raw = c[key] as number | string;
                return (
                  <div key={key} className="bg-[#0a0f1e] px-4 py-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-0.5 font-semibold text-white">{format ? format(raw) : String(raw)}</p>
                  </div>
                );
              })}
              <div className="col-span-2 bg-[#0a0f1e] px-4 py-3">
                <p className="text-xs text-slate-500">Location</p>
                <p className="mt-0.5 font-semibold text-white">
                  {c.city ? `${c.city}, ${c.state ?? ""}` : c.state}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}