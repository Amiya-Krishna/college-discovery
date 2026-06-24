import { cookies } from "next/headers";
import Link from "next/link";

const stats = [
  { value: "1,200+", label: "Colleges" },
  { value: "28", label: "States covered" },
  { value: "50K+", label: "Students helped" },
];

const features = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
      </svg>
    ),
    title: "Smart Search",
    desc: "Filter by state, fees, rating, and packages to find exactly what you need.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Side-by-Side Compare",
    desc: "Compare up to 3 colleges on fees, ratings, and placement packages instantly.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0115.186 0z" />
      </svg>
    ),
    title: "Save & Revisit",
    desc: "Bookmark colleges to your personal list and revisit anytime.",
  },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get("token")?.value);
  const loginFor = (path: string) => `/login?callbackUrl=${encodeURIComponent(path)}`;

  return (
    <main className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-80 -left-40 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[100px]" />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-semibold tracking-wide text-indigo-300">India&apos;s College Discovery Platform</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient">Find the college</span>
            <br />
            <span className="text-white">that fits your future.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Explore 1,200+ colleges across India. Compare fees, ratings, and placement data — all in one place.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={isLoggedIn ? "/colleges" : loginFor("/colleges")}
              className="btn-primary w-full px-8 py-3.5 text-base sm:w-auto"
            >
              Explore Colleges
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href={isLoggedIn ? "/compare" : loginFor("/compare")}
              className="btn-ghost w-full px-8 py-3.5 text-base sm:w-auto"
            >
              Compare Colleges
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mx-auto mt-20 max-w-2xl">
          <div className="grid grid-cols-3 divide-x divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur">
            {stats.map(({ value, label }) => (
              <div key={label} className="px-6 py-5 text-center">
                <p className="text-2xl font-bold text-white sm:text-3xl">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Everything you need to decide</h2>
          <p className="mt-3 text-sm text-slate-500">No noise, just the data that matters.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition-all hover:border-indigo-500/30 hover:bg-white/[0.06]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
                {icon}
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}