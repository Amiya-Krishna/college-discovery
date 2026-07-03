"use client";

import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordInput from "../components/PasswordInput";

type SignupResponse = {
  success?: boolean;
  error?: string | object;
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post<SignupResponse>("/api/auth/signup", { name, email, password });
      if (!response.data.success) {
        const errorMsg = typeof response.data.error === "string" ? response.data.error : "Signup failed";
        throw new Error(errorMsg);
      }
      router.push("/login");
    } catch (signupError) {
      if (axios.isAxiosError(signupError)) {
        const apiError = signupError.response?.data?.error;
        if (typeof apiError === "string") {
          setError(apiError);
        } else if (apiError && typeof apiError === "object") {
          const fieldErrors = (apiError as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {};
          const messages = Object.values(fieldErrors).flat();
          setError(messages[0] ?? "Validation failed");
        } else {
          setError("Signup failed");
        }
        return;
      }
      setError(signupError instanceof Error ? signupError.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[120px]" />
      </div>

      <section className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0f1629]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

          <div className="p-8">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/20">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
            <p className="mt-1.5 text-sm text-slate-500">Join EduFind and start saving colleges.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-slate-400">Full name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="input-dark" placeholder="Your name" autoComplete="name" required />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">Email address</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-dark" placeholder="you@example.com" autoComplete="email" required />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
                <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters" autoComplete="new-password" required />
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-3">
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}