import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Retourne YYYY-MM-DD pour un Date */
export function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Date d'il y a N jours */
export function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}
