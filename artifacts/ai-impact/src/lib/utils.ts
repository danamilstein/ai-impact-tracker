import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function formatSmall(value: number, unit: string): string {
  if (value === 0) return `0 ${unit}`;
  if (value >= 10) return `${Math.round(value)} ${unit}`;
  if (value >= 1) return `${value.toFixed(1)} ${unit}`;
  if (value >= 0.1) return `${value.toFixed(2)} ${unit}`;
  return `<0.1 ${unit}`;
}

export function formatWater(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`;
  return formatSmall(ml, "ml");
}

export function formatCo2(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`;
  return formatSmall(g, "g");
}

export function formatEnergy(wh: number): string {
  if (wh >= 1000) return `${(wh / 1000).toFixed(2)} kWh`;
  return formatSmall(wh, "Wh");
}

/**
 * Renders a real-world equivalence count (water bottles, km driven, phone
 * charges, etc.) consistently across the app:
 *  - exactly 0 → "0"
 *  - 0 < value < 0.1 → "< 0.1" (never misleadingly rounds a nonzero impact to 0)
 *  - 0.1 ≤ value ≤ 10 → one decimal place (matches the driving-distance style)
 *  - value > 10 → nearest whole number for readability
 */
export function formatEquiv(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value < 0.1) return "< 0.1";
  if (value > 10) return String(Math.round(value));
  return value.toFixed(1);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}
