"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/sections/dashboard/widgets/_ui/Card";
import { useCrmAuth } from "@/context/crm-auth-context";
import {
  getSettingsPageDict,
  type SettingsLocale,
} from "@/data/dictionaries/settings-page";
import { createCrmAgent, fetchCrmAgents } from "@/lib/crm-client";

const uiLocale: SettingsLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

export const TeamAgentsSection = (): React.JSX.Element => {
  const copy = useMemo(() => getSettingsPageDict(uiLocale), []);
  const { isAdmin } = useCrmAuth();

  const [agents, setAgents] = useState<
    { id: string; name: string; email: string; role: string }[]
  >([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loadAgents = useCallback(async (): Promise<void> => {
    if (!isAdmin) {
      return;
    }
    setLoadError(null);
    try {
      const list = await fetchCrmAgents();
      setAgents(list);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : copy.loadAgentsError);
    }
  }, [copy.loadAgentsError, isAdmin]);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      !submitting
    );
  }, [name, email, password, submitting]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      await createCrmAgent({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setFormSuccess(copy.createSuccess);
      setName("");
      setEmail("");
      setPassword("");
      await loadAgents();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : copy.createError);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card title={copy.teamTitle} subtitle={copy.teamSubtitle}>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {copy.teamAdminOnly}
        </p>
      </Card>
    );
  }

  return (
    <Card title={copy.teamTitle} subtitle={copy.teamSubtitle}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {formError ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {formError}
          </p>
        ) : null}
        {formSuccess ? (
          <p
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
            role="status"
          >
            {formSuccess}
          </p>
        ) : null}

        <div>
          <label
            htmlFor="team-agent-name"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {copy.agentNameLabel}
          </label>
          <input
            id="team-agent-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 h-10 w-full max-w-md rounded-xl border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
          />
        </div>
        <div>
          <label
            htmlFor="team-agent-email"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {copy.agentEmailLabel}
          </label>
          <input
            id="team-agent-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 h-10 w-full max-w-md rounded-xl border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
          />
        </div>
        <div>
          <label
            htmlFor="team-agent-password"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {copy.agentPasswordLabel}
          </label>
          <input
            id="team-agent-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            aria-describedby="team-agent-password-hint"
            className="mt-2 h-10 w-full max-w-md rounded-xl border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
          />
          <p
            id="team-agent-password-hint"
            className="mt-1 text-xs text-zinc-500 dark:text-zinc-400"
          >
            {copy.agentPasswordHint}
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
        >
          {submitting ? copy.creatingAgent : copy.createAgent}
        </button>
      </form>

      <div className="mt-8 border-t border-zinc-200/80 pt-6 dark:border-white/10">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {copy.agentsListLabel}
        </h3>
        {loadError ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {loadError}
          </p>
        ) : agents.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {copy.noAgentsYet}
          </p>
        ) : (
          <ul className="mt-3 space-y-2" role="list">
            {agents.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/80 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900/30"
              >
                <span className="min-w-0 flex-1 truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {a.name}
                </span>
                <span className="min-w-0 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {a.email}
                </span>
                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-800 dark:bg-blue-950/80 dark:text-blue-200">
                  {a.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};
