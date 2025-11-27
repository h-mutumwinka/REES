import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

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
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
