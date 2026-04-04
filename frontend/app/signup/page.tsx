"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCrmAuth } from "@/context/crm-auth-context";
import { useOrgBranding } from "@/context/org-branding-context";
import { getSignupPageDict, type SignupLocale } from "@/data/dictionaries/signup-page";
import { getCrmAuthToken } from "@/lib/crm-auth-token";
import { clearAuthCookie } from "@/lib/crm-auth-session";
import { signupCrm } from "@/lib/crm-client";

const uiLocale: SignupLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

export default function SignupPage(): React.JSX.Element {
  const router = useRouter();
  const { login, ready, isAuthenticated } = useCrmAuth();
  const { organization } = useOrgBranding();
  const copy = useMemo(() => getSignupPageDict(uiLocale), []);

  const [name, setName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!getCrmAuthToken()) {
      clearAuthCookie();
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (isAuthenticated) {
      router.replace("/setup");
    }
  }, [ready, isAuthenticated, router]);

  const canSubmit = useMemo(() => {
    return (
      companyName.trim().length > 0 &&
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      !isSubmitting
    );
  }, [companyName, name, email, password, isSubmitting]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { token, user, organization } = await signupCrm({
        companyName: companyName.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
      });
      login(token, user, organization?.slug);
      router.replace("/setup");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(1100px_600px_at_20%_-10%,theme(colors.emerald.100),transparent_60%),radial-gradient(900px_500px_at_90%_0%,theme(colors.sky.100),transparent_55%),linear-gradient(to_bottom,theme(colors.white),theme(colors.zinc.50))] text-zinc-950 dark:bg-[radial-gradient(1100px_600px_at_20%_-10%,theme(colors.emerald.950),transparent_60%),radial-gradient(900px_500px_at_90%_0%,theme(colors.sky.950),transparent_55%),linear-gradient(to_bottom,theme(colors.zinc.950),theme(colors.black))] dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-[1100px] flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:justify-between">
        <section className="w-full max-w-xl">
          <div className="inline-flex items-center gap-3">
            <div
              className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 dark:bg-emerald-500 dark:text-zinc-950"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {organization?.name ?? "ClientFlow"}
              </p>
              <p className="text-sm font-semibold">WhatsApp-first CRM</p>
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-700 dark:text-zinc-200">
            {copy.subtitle}
          </p>
        </section>

        <section className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{copy.title}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {copy.subtitle}
                </p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/15 dark:text-sky-200">
                {copy.badge}
              </span>
            </div>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              {error ? (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="signup-company"
                >
                  {copy.companyLabel}
                </label>
                <input
                  id="signup-company"
                  type="text"
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="signup-name"
                >
                  {copy.nameLabel}
                </label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="signup-email"
                >
                  {copy.emailLabel}
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="signup-password"
                >
                  {copy.passwordLabel}
                </label>
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  aria-describedby="signup-password-hint"
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
                />
                <p
                  id="signup-password-hint"
                  className="mt-1 text-xs text-zinc-500 dark:text-zinc-400"
                >
                  {copy.passwordHint}
                </p>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                style={{ backgroundColor: "var(--brand-primary)" }}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:text-zinc-950 dark:focus-visible:ring-white/20"
              >
                {isSubmitting ? copy.submitting : copy.submit}
              </button>

              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {copy.footerHint}
              </p>

              <p className="text-center text-sm">
                <Link
                  href="/login"
                  className="font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                >
                  {copy.linkToLogin}
                </Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
