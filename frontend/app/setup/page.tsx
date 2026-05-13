"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CrmMobileNavBackdrop,
  CrmMobileNavMenuButton,
} from "@/components/sections/dashboard/CrmShell/crm-mobile-nav-controls";
import { InboxSidebar } from "@/components/sections/dashboard/InboxPage/InboxSidebar";
import type { DashboardNavLocale } from "@/data/dictionaries/dashboard-nav";
import { getDashboardNavDict } from "@/data/dictionaries/dashboard-nav";
import { useCrmAuth } from "@/context/crm-auth-context";
import { useOrgBranding } from "@/context/org-branding-context";
import { patchCrmOrganization } from "@/lib/crm-client";

const uiLocale: DashboardNavLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

export default function SetupPage(): React.JSX.Element {
  const router = useRouter();
  const { isAdmin } = useCrmAuth();
  const { organization } = useOrgBranding();

  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioWhatsAppNumber, setTwilioWhatsAppNumber] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const navCopy = useMemo(() => getDashboardNavDict(uiLocale), []);

  const canSave = useMemo(() => {
    return (
      isAdmin &&
      !saving &&
      twilioAccountSid.trim().length > 0 &&
      twilioAuthToken.trim().length > 0 &&
      twilioWhatsAppNumber.trim().length > 0
    );
  }, [isAdmin, saving, twilioAccountSid, twilioAuthToken, twilioWhatsAppNumber]);

  const onSave = async (): Promise<void> => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await patchCrmOrganization({
        twilioAccountSid: twilioAccountSid.trim(),
        twilioAuthToken: twilioAuthToken.trim(),
        twilioWhatsAppNumber: twilioWhatsAppNumber.trim(),
        primaryColor: primaryColor.trim() || undefined,
      });
      router.replace("/inbox");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Setup failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      id="main"
      className="relative flex h-[100dvh] w-full overflow-hidden bg-zinc-50/90 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <CrmMobileNavBackdrop
        open={navOpen}
        onClose={() => {
          setNavOpen(false);
        }}
        closeLabel={navCopy.closeNavigationMenuAria}
      />
      <InboxSidebar
        mobileDrawerOpen={navOpen}
        onMobileDrawerClose={() => {
          setNavOpen(false);
        }}
      />
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-start gap-3 border-b border-zinc-200/80 bg-white/90 px-4 py-4 shadow-sm sm:px-5 sm:py-5 dark:border-white/10 dark:bg-zinc-950/80">
          <CrmMobileNavMenuButton
            label={navCopy.openNavigationMenuAria}
            onClick={() => {
              setNavOpen(true);
            }}
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Setup {organization?.name ? `— ${organization.name}` : ""}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Connect your WhatsApp (Twilio) credentials for this organization.
            </p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5 sm:py-6">
          <div className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
            {!isAdmin ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Only an admin can complete setup.
              </p>
            ) : (
              <>
                {error ? (
                  <p
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold" htmlFor="tw-sid">
                      Twilio Account SID
                    </label>
                    <input
                      id="tw-sid"
                      value={twilioAccountSid}
                      onChange={(e) => setTwilioAccountSid(e.target.value)}
                      className="mt-2 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor="tw-token">
                      Twilio Auth Token
                    </label>
                    <input
                      id="tw-token"
                      value={twilioAuthToken}
                      onChange={(e) => setTwilioAuthToken(e.target.value)}
                      className="mt-2 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor="tw-wa">
                      Twilio WhatsApp Number
                    </label>
                    <input
                      id="tw-wa"
                      placeholder="whatsapp:+14155238886"
                      value={twilioWhatsAppNumber}
                      onChange={(e) => setTwilioWhatsAppNumber(e.target.value)}
                      className="mt-2 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor="brand-color">
                      Primary color (optional)
                    </label>
                    <input
                      id="brand-color"
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
                  onClick={() => {
                    void onSave();
                  }}
                  disabled={!canSave}
                  style={{ backgroundColor: "var(--brand-primary)" }}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save & continue"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

