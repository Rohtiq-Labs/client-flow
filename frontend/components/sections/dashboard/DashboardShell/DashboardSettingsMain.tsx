"use client";

import { useState } from "react";
import { TeamAgentsSection } from "@/components/sections/dashboard/DashboardShell/TeamAgentsSection";
import { Card } from "@/components/sections/dashboard/widgets/_ui/Card";

export const DashboardSettingsMain = (): React.JSX.Element => {
  const [emailDigest, setEmailDigest] = useState<boolean>(true);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(false);
  const [assignRoundRobin, setAssignRoundRobin] = useState<boolean>(true);

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4">
      <TeamAgentsSection />

      <Card title="Workspace" subtitle="ClientFlow team defaults">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Workspace name</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Shown in the sidebar and invites
              </p>
            </div>
            <input
              type="text"
              defaultValue="Sales Inbox"
              className="h-10 max-w-[200px] rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
              aria-label="Workspace name"
            />
          </div>
        </div>
      </Card>

      <Card title="Notifications" subtitle="How you get alerted">
        <ul className="space-y-4" role="list">
          <li className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Daily email digest</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Summary of unread threads and due tasks
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailDigest}
              onClick={() => setEmailDigest(!emailDigest)}
              className={[
                "relative h-7 w-12 shrink-0 rounded-full transition",
                emailDigest
                  ? "bg-emerald-600 dark:bg-emerald-500"
                  : "bg-zinc-300 dark:bg-zinc-600",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 size-6 rounded-full bg-white shadow transition",
                  emailDigest ? "left-5" : "left-0.5",
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="sr-only">Daily email digest</span>
            </button>
          </li>
          <li className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Sound for new WhatsApp</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Play a short tone on inbound messages
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundAlerts}
              onClick={() => setSoundAlerts(!soundAlerts)}
              className={[
                "relative h-7 w-12 shrink-0 rounded-full transition",
                soundAlerts
                  ? "bg-emerald-600 dark:bg-emerald-500"
                  : "bg-zinc-300 dark:bg-zinc-600",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 size-6 rounded-full bg-white shadow transition",
                  soundAlerts ? "left-5" : "left-0.5",
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="sr-only">Sound alerts</span>
            </button>
          </li>
        </ul>
      </Card>

      <Card title="Routing" subtitle="Incoming lead handling">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Round-robin assignment</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Distribute new chats across available owners
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={assignRoundRobin}
            onClick={() => setAssignRoundRobin(!assignRoundRobin)}
            className={[
              "relative h-7 w-12 shrink-0 rounded-full transition",
              assignRoundRobin
                ? "bg-emerald-600 dark:bg-emerald-500"
                : "bg-zinc-300 dark:bg-zinc-600",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 size-6 rounded-full bg-white shadow transition",
                assignRoundRobin ? "left-5" : "left-0.5",
              ].join(" ")}
              aria-hidden="true"
            />
            <span className="sr-only">Round-robin assignment</span>
          </button>
        </div>
      </Card>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        Preferences are local for now — sync with your API when the backend is
        ready.
      </p>
    </div>
  );
};
