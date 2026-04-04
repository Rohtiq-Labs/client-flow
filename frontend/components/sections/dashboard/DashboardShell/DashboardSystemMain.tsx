"use client";

import { useMemo, useState } from "react";
import { patchCrmOrganization } from "@/lib/crm-client";
import { useCrmAuth } from "@/context/crm-auth-context";
import type { SystemLocale } from "@/data/dictionaries/system-page";
import { getSystemPageDict } from "@/data/dictionaries/system-page";
import { Card } from "@/components/sections/dashboard/widgets/_ui/Card";

const uiLocale: SystemLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

export const DashboardSystemMain = (): React.JSX.Element => {
  const copy = useMemo(() => getSystemPageDict(uiLocale), []);
  const { isAdmin } = useCrmAuth();

  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioWhatsAppNumber, setTwilioWhatsAppNumber] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<"success" | "error" | null>(null);
  const [saveErrorDetail, setSaveErrorDetail] = useState<string | null>(null);

  const canSave = useMemo(() => {
    if (!isAdmin || saving) return false;
    return (
      twilioAccountSid.trim().length > 0 &&
      twilioAuthToken.trim().length > 0 &&
      twilioWhatsAppNumber.trim().length > 0
    );
  }, [isAdmin, saving, twilioAccountSid, twilioAuthToken, twilioWhatsAppNumber]);

  const onSave = async (): Promise<void> => {
    if (!canSave) return;
    setSaving(true);
    setNotice(null);
    setSaveErrorDetail(null);
    try {
      await patchCrmOrganization({
        twilioAccountSid: twilioAccountSid.trim(),
        twilioAuthToken: twilioAuthToken.trim(),
        twilioWhatsAppNumber: twilioWhatsAppNumber.trim(),
        primaryColor: primaryColor.trim() || undefined,
      });
      setNotice("success");
    } catch (e) {
      setNotice("error");
      setSaveErrorDetail(e instanceof Error ? e.message : copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4">
      <Card title={copy.title} subtitle={copy.subtitle}>
        {!isAdmin ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400" role="note">
            {copy.adminOnly}
          </p>
        ) : (
          <>
            {notice ? (
              <p
                className={[
                  "mb-4 rounded-xl border px-3 py-2 text-xs",
                  notice === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                    : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200",
                ].join(" ")}
                role={notice === "error" ? "alert" : "status"}
              >
                {notice === "success"
                  ? copy.saveSuccess
                  : saveErrorDetail ?? copy.saveError}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold" htmlFor="sys-tw-sid">
                  {copy.twilioSidLabel}
                </label>
                <input
                  id="sys-tw-sid"
                  value={twilioAccountSid}
                  onChange={(e) => setTwilioAccountSid(e.target.value)}
                  className="mt-2 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="sys-tw-token"
                >
                  {copy.twilioTokenLabel}
                </label>
                <input
                  id="sys-tw-token"
                  value={twilioAuthToken}
                  onChange={(e) => setTwilioAuthToken(e.target.value)}
                  className="mt-2 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold" htmlFor="sys-tw-wa">
                  {copy.twilioNumberLabel}
                </label>
                <input
                  id="sys-tw-wa"
                  placeholder="whatsapp:+14155238886"
                  value={twilioWhatsAppNumber}
                  onChange={(e) => setTwilioWhatsAppNumber(e.target.value)}
                  className="mt-2 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="sys-brand-color"
                >
                  {copy.primaryColorLabel}
                </label>
                <input
                  id="sys-brand-color"
                  placeholder="#16a34a"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="mt-2 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
                  autoComplete="off"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => void onSave()}
              disabled={!canSave}
              style={{ backgroundColor: "var(--brand-primary)" }}
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? copy.saving : copy.save}
            </button>
          </>
        )}
      </Card>
    </div>
  );
};

