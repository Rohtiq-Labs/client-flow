import type { JSX } from "react";

type CrmMobileNavBackdropProps = {
  open: boolean;
  onClose: () => void;
  closeLabel: string;
};

export const CrmMobileNavBackdrop = ({
  open,
  onClose,
  closeLabel,
}: CrmMobileNavBackdropProps): JSX.Element | null => {
  if (!open) {
    return null;
  }
  return (
    <button
      type="button"
      className="fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-[2px] lg:hidden"
      aria-label={closeLabel}
      onClick={onClose}
    />
  );
};

type CrmMobileNavMenuButtonProps = {
  label: string;
  onClick: () => void;
};

export const CrmMobileNavMenuButton = ({
  label,
  onClick,
}: CrmMobileNavMenuButtonProps): JSX.Element => {
  return (
    <button
      type="button"
      className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200/80 bg-white text-zinc-800 shadow-sm outline-none transition hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-emerald-500 lg:hidden dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      aria-label={label}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    </button>
  );
};
