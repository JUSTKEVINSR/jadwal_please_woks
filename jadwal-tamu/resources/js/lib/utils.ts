import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility untuk menggabungkan className Tailwind dengan aman.
 * Menghindari duplikasi dan conflict antara kondisi dinamis.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
