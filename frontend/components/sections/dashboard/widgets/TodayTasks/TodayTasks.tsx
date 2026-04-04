"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/sections/dashboard/widgets/_ui/Card";
import { useDashboardState } from "@/context/dashboard-state-context";
import type { TaskItem } from "@/data/dashboard-seed";

const PriorityPill = ({
  priority,
}: {
  priority: TaskItem["priority"];
}): React.JSX.Element => {
  const className =
    priority === "High"
      ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
      : priority === "Medium"
        ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
        : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200";
  return (
    <span
      className={[
        "rounded-full px-2 py-1 text-[11px] font-semibold",
        className,
      ].join(" ")}
    >
      {priority}
    </span>
  );
};

export const TodayTasks = (): React.JSX.Element => {
  const {
    tasks,
    toggleTaskDone,
    addTask,
    showAddTask,
    setShowAddTask,
    searchQuery,
    conversations,
  } = useDashboardState();

  const [title, setTitle] = useState<string>("");
  const [relatedTo, setRelatedTo] = useState<string>("");
  const [due, setDue] = useState<string>("Today");
  const [priority, setPriority] = useState<TaskItem["priority"]>("Medium");

  const contactOptions = useMemo(
    () => conversations.map((c) => c.name),
    [conversations],
  );

  const visibleTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.relatedTo.toLowerCase().includes(q),
    );
  }, [tasks, searchQuery]);

  const onSubmitAdd = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    addTask({
      title,
      relatedTo: relatedTo || contactOptions[0] || "Unassigned",
      due,
      priority,
    });
    setTitle("");
    setRelatedTo("");
    setDue("Today");
    setPriority("Medium");
  };

  return (
    <Card
      title="Today"
      subtitle="Focus tasks tied to WhatsApp conversations"
      right={
        <button
          type="button"
          onClick={() => setShowAddTask(!showAddTask)}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          aria-expanded={showAddTask}
        >
          Add task
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      }
    >
      {showAddTask ? (
        <form
          onSubmit={onSubmitAdd}
          className="mb-4 space-y-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <p className="text-sm font-semibold">New task</p>
          <div>
            <label className="text-xs font-semibold" htmlFor="task-title">
              Title
            </label>
            <input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
            />
          </div>
          <div>
            <label className="text-xs font-semibold" htmlFor="task-related">
              Related contact
            </label>
            <select
              id="task-related"
              value={relatedTo}
              onChange={(e) => setRelatedTo(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
            >
              <option value="">Pick a contact…</option>
              {contactOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold" htmlFor="task-due">
                Due
              </label>
              <input
                id="task-due"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
              />
            </div>
            <div>
              <label className="text-xs font-semibold" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as TaskItem["priority"])
                }
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="h-10 flex-1 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAddTask(false)}
              className="h-10 flex-1 rounded-xl border border-zinc-200/70 text-sm font-semibold dark:border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <ul className="space-y-2" aria-label="Task list">
        {visibleTasks.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-200/80 p-6 text-center text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
            No tasks match your search.
          </li>
        ) : (
          visibleTasks.map((task) => (
            <li key={task.id}>
              <div
                className={[
                  "flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-white/60 p-3 shadow-sm dark:border-white/10 dark:bg-zinc-950/30",
                  task.done ? "opacity-70" : "",
                ].join(" ")}
              >
                <div className="pt-0.5">
                  <input
                    id={`task-${task.id}`}
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTaskDone(task.id)}
                    className="mt-1 size-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    aria-label={`Mark task ${task.title} as ${task.done ? "not done" : "done"}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className="block cursor-pointer text-sm font-semibold"
                  >
                    {task.title}
                  </label>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    Related to{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {task.relatedTo}
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <PriorityPill priority={task.priority} />
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                      {task.due}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
};
