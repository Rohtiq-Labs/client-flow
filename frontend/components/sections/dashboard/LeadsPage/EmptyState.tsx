type EmptyStateProps = {
  title?: string;
  description?: string;
};

export const EmptyState = ({
  title = "No leads found. Add new leads to get started.",
  description = "Try adjusting search or filters, or add a lead to see them here.",
}: EmptyStateProps): React.JSX.Element => {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
      role="status"
    >
      <div className="max-w-md rounded-2xl border border-dashed border-zinc-200/90 bg-zinc-50/80 px-8 py-12 shadow-sm dark:border-white/10 dark:bg-zinc-900/40">
        <div
          className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-zinc-200/80 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M22 21v-2a3 3 0 0 0-2.2-2.9" />
            <path d="M16.8 3.1a4 4 0 0 1 0 7.8" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
};
