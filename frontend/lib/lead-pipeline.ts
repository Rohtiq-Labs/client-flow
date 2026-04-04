import type { LeadPipelineStatus } from "@/data/inbox-mock-data";

const UI_ORDER: LeadPipelineStatus[] = [
  "New",
  "Replied",
  "Interested",
  "Converted",
  "Lost",
];

/** Maps API / socket lowercase status to UI label */
export const leadStatusApiToUi = (api: string): LeadPipelineStatus => {
  const x = String(api).toLowerCase();
  for (const u of UI_ORDER) {
    if (u.toLowerCase() === x) {
      return u;
    }
  }
  return "New";
};

/** Maps UI label to API body `{ status: ... }` */
export const leadStatusUiToApi = (ui: LeadPipelineStatus): string =>
  ui.toLowerCase();
