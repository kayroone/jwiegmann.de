import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS classes intelligently
 * Resolves conflicts by letting later classes override earlier ones
 *
 * @example
 * cn("p-4 bg-red-500", "p-8 bg-blue-500") // → "p-8 bg-blue-500"
 * cn("p-4", isActive && "bg-blue-500")    // → conditional classes
 *
 * @param inputs - Class values (strings, arrays, objects, conditionals)
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
