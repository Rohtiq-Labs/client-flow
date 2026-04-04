type CardProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const Card = ({
  title,
  subtitle,
  right,
  children,
  className,
}: CardProps): React.JSX.Element => {
  return (
    <div
      className={[
        "rounded-2xl border border-zinc-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/40",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4 border-b border-zinc-200/70 px-4 py-4 dark:border-white/10">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

