export type ReminderChoice = "tomorrow" | "next-week";

export function getReminderDate(choice: ReminderChoice, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + (choice === "tomorrow" ? 1 : 7));
  date.setHours(9, 0, 0, 0);
  return date;
}
