import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const UNDERSCORE_REGEX = /_/g
const CAPITAL_LETTER_REGEX = /([A-Z])/g
const FIRST_LETTER_REGEX = /^\w/
const MULTIPLE_SPACES_REGEX = /\s+/g

export function toSentenceCase(str: string) {
  return str
    .replace(UNDERSCORE_REGEX, " ")
    .replace(CAPITAL_LETTER_REGEX, " $1")
    .toLowerCase()
    .replace(FIRST_LETTER_REGEX, (c) => c.toUpperCase())
    .replace(MULTIPLE_SPACES_REGEX, " ")
    .trim()
}

export function generateId({ prefix }: { prefix?: string } = {}) {
  return `${prefix ? `${prefix}_` : ""}${uuidv4()}`
}
