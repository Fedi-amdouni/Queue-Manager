import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWaitTime(minutes: number | undefined | null) {
  if (minutes === undefined || minutes === null) return "--";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins > 0 ? mins + 'm' : ''}`;
}

export const PRIORITY_COLORS: Record<string, string> = {
  NORMAL: "bg-slate-100 text-slate-700 border-slate-200",
  URGENT: "bg-red-100 text-red-700 border-red-200 animate-pulse",
  PREGNANT: "bg-purple-100 text-purple-700 border-purple-200",
  ELDERLY: "bg-amber-100 text-amber-700 border-amber-200",
  DISABLED: "bg-blue-100 text-blue-700 border-blue-200",
};

export const STATUS_COLORS: Record<string, string> = {
  WAITING: "bg-blue-100 text-blue-700 border-blue-200",
  CALLED: "bg-green-100 text-green-700 border-green-200",
  IN_SERVICE: "bg-purple-100 text-purple-700 border-purple-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  ABSENT: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED: "bg-green-100 text-green-700 border-green-200",
  NO_SHOW: "bg-red-100 text-red-700 border-red-200",
};
