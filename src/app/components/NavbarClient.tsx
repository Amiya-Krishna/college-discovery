"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

interface NavbarClientProps {
  brand?: string;
  links?: NavItem[];
  className?: string;
  isLoggedIn: boolean;
}

function loginRedirect(path: string) {
  return `/login?callbackUrl=${encodeURIComponent(path)}`;
}

const HISTORY_KEY = "app_history_stack";

/**
 * Persists a history stack in sessionStorage so back-navigation works
 * even after a hard refresh, and across every page — not just detail pages.
 *
 * Rules:
 *  - On mount: read existing stack from sessionStorage.
 *  - When pathname changes forward: push new entry.
 *  - When pathname matches second-to-last entry (browser/router back): pop.
 *  - canGoBack is true whenever stack has more than one entry.
 */
function useHistoryStack() {
  const pathname = usePathname();

  const [stack, setStack] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const prevRef = useRef(pathname);

  useEffect(() => {
    setMounted(true);

    try {
      const saved = sessionStorage.getItem(HISTORY_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as string[];

        if (parsed.length === 0) {
          const initial = [pathname];

          setStack(initial);

          sessionStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(initial)
          );
        } else {
          setStack(parsed);
        }
      } else {
        const initial = [pathname];

        setStack(initial);

        sessionStorage.setItem(
          HISTORY_KEY,
          JSON.stringify(initial)
        );
      }
    } catch {
      setStack([pathname]);
    }

    prevRef.current = pathname;
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (pathname === prevRef.current) return;

    prevRef.current = pathname;

    setStack((prev) => {
      let next: string[];

      // Browser back
      if (
        prev.length >= 2 &&
        prev[prev.length - 2] === pathname
      ) {
        next = prev.slice(0, -1);
      } else {
        next =
          prev[prev.length - 1] === pathname
            ? prev
            : [...prev, pathname];
      }

      try {
        sessionStorage.setItem(
          HISTORY_KEY,
          JSON.stringify(next)
        );
      } catch {}

      return next;
    });
  }, [pathname, mounted]);

  return mounted && stack.length > 1;
}

export default function NavbarClient({
  brand = "EduFind",
  links = [],
  isLoggedIn,
  className = "",
}: NavbarClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const canGoBack = useHistoryStack();

  // Close menu on route change
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      setIsMenuOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const close = () => setIsMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.08] bg-[#070b17]/95 backdrop-blur-2xl shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
          : "border-b border-white/[0.04] bg-[#070b17]/80 backdrop-blur-xl"
      } ${className}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* ── Left: back arrow + brand ── */}
        <div className="flex items-center gap-2">

          {/* Back button — visible on ANY page when history exists */}
          <div
            className={`transition-all duration-200 ${
              canGoBack ? "w-9 opacity-100" : "w-0 opacity-0 overflow-hidden"
            }`}
          >
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              tabIndex={canGoBack ? 0 : -1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-95"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-[0_0_16px_rgba(99,102,241,0.45)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(99,102,241,0.7)]">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white">{brand}</span>
          </Link>
        </div>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {links.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={isLoggedIn ? item.href : loginRedirect(item.href)}
                aria-current={isActive ? "page" : undefined}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                  after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:rounded-full after:bg-indigo-400 after:transition-transform after:duration-200
                  ${isActive
                    ? "bg-indigo-500/10 text-white after:scale-x-100"
                    : "text-slate-400 hover:bg-white/[0.07] hover:text-white after:scale-x-0 hover:after:scale-x-100"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Auth + Hamburger ── */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <form action="/api/auth/logout" method="post" className="hidden md:block">
              <button
                type="submit"
                className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-400 transition-all duration-200 hover:border-rose-500/60 hover:bg-rose-500/20 hover:text-rose-300 active:scale-[0.97]"
              >
                Logout
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-slate-500 hover:bg-white/[0.05] hover:text-white active:scale-[0.97]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(52,211,153,0.35)] active:scale-[0.97]"
              >
                Sign up
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition-all duration-200 hover:bg-white/[0.1] hover:text-white md:hidden active:scale-95"
          >
            <span className="relative flex h-4 w-4 flex-col items-center justify-center gap-[5px]">
              <span className={`h-px w-4 rounded-full bg-current transition-all duration-300 ${isMenuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`h-px w-4 rounded-full bg-current transition-all duration-300 ${isMenuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`h-px w-4 rounded-full bg-current transition-all duration-300 ${isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      <div
        className={`overflow-hidden border-t border-white/[0.06] transition-all duration-300 md:hidden ${
          isMenuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile navigation">

          {/* Mobile back row — shown whenever canGoBack */}
          {canGoBack && (
            <button
              type="button"
              onClick={() => { handleBack(); setIsMenuOpen(false); }}
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-white/[0.07] hover:text-indigo-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Go back
            </button>
          )}

          {/* Divider only when back row is present */}
          {canGoBack && <div className="mx-4 h-px bg-white/[0.06]" />}

          {links.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={isLoggedIn ? item.href : loginRedirect(item.href)}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-indigo-500/10 text-white"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                  }`}
              >
                {item.label}
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />}
              </Link>
            );
          })}

          <div className="mt-2 flex flex-col gap-2 border-t border-white/[0.06] pt-3">
            {isLoggedIn ? (
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="w-full rounded-xl border border-rose-500/40 bg-rose-500/10 py-2.5 text-sm font-semibold text-rose-400 transition-all hover:bg-rose-500/20 hover:text-rose-300">
                  Logout
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl border border-slate-700 py-2.5 text-center text-sm font-semibold text-slate-300 transition-all hover:border-slate-500 hover:bg-white/[0.05] hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500"
                >
                  Sign up
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}