import { customAlphabet } from "nanoid"

// Generate referral codes using only uppercase letters and numbers
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8)

export function generateReferralCode(): string {
  return nanoid()
}
