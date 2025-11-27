import crypto from "crypto"

/**
 * Hash password using SHA-256
 * Note: For production, consider using bcrypt or argon2
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

