import { type NextRequest, NextResponse } from "next/server"
import Database from "better-sqlite3"
import crypto from "crypto"
import path from "path"

let db: Database.Database

function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), "rees.db")
    db = new Database(dbPath)
  }
  return db
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const database = getDb()
    const user = database.prepare("SELECT id, role, password FROM users WHERE email = ?").get(email) as any

    if (!user || user.password !== hashPassword(password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      userId: user.id,
      role: user.role,
    })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
