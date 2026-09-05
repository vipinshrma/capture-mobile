export type ReminderChoice = "tomorrow" | "next-week";

export function getReminderDate(choice: ReminderChoice, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + (choice === "tomorrow" ? 1 : 7));
  date.setHours(9, 0, 0, 0);
  return date;
}

export function mergeReminderDate(current: Date, selected: Date, part: "date" | "time") {
  const next = new Date(current);
  if (part === "date") next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
  else next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
  return next;
}

export function formatReminderLabel(reminderAt?: string, now = new Date()) {
  if (!reminderAt) return undefined;
  const reminder = new Date(reminderAt);
  if (Number.isNaN(reminder.getTime())) return undefined;
  if (reminder <= now) return "Reminder due";
  const time = reminder.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(reminder.getFullYear(), reminder.getMonth(), reminder.getDate());
  const dayDifference = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  if (dayDifference === 0) return `Reminded: Today, ${time}`;
  if (dayDifference === 1) return `Reminded: Tomorrow, ${time}`;
  return `Reminded: ${reminder.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}
