"use client";

type AgentOption = {
  id: string;
  name: string;
  email: string;
};

type LeadAssignSelectProps = {
  leadId: string;
  agents: AgentOption[];
  valueId: string | null;
  disabled: boolean;
  saving: boolean;
  labels: {
    unassigned: string;
    assignLabel: string;
    saving: string;
  };
  onAssign: (leadId: string, agentId: string | null) => void;
};

export const LeadAssignSelect = ({
  leadId,
  agents,
  valueId,
  disabled,
  saving,
  labels,
  onAssign,
}: LeadAssignSelectProps): React.JSX.Element => {
  const selectId = `assign-${leadId}`;

  return (
    <div className="min-w-0">
      <label htmlFor={selectId} className="sr-only">
        {labels.assignLabel}
      </label>
      <select
        id={selectId}
        value={valueId ?? ""}
        disabled={disabled || saving}
        onChange={(e) => {
          const v = e.target.value;
          onAssign(leadId, v === "" ? null : v);
        }}
        className="h-9 w-full max-w-[200px] rounded-lg border border-zinc-200/90 bg-white px-2 text-xs font-medium text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-50 dark:focus:border-emerald-400"
      >
        <option value="">{labels.unassigned}</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name?.trim() || a.email}
          </option>
        ))}
      </select>
      {saving ? (
        <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
          {labels.saving}
        </p>
      ) : null}
    </div>
  );
};
