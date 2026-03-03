import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a date string from the backend.
 * Ensures the string is treated as UTC if no timezone is provided.
 */
export function parseDate(dateString) {
  if (!dateString) return new Date();
  const utcString = dateString.endsWith('Z') || dateString.includes('+') ? dateString : `${dateString}Z`;
  return new Date(utcString);
}
