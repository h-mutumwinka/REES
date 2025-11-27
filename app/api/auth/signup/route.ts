import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { checkDatabaseAvailability } from "@/lib/db-check"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Signup attempt for:", { email, role, name: name.substring(0, 3) + "***" })

    // Check if database module is available first
    const dbCheck = checkDatabaseAvailability()
    if (!dbCheck.available) {
      console.error("Database module not available:", dbCheck)
      return NextResponse.json(
        {
          error: "Database module not available",
          details: dbCheck.error,
          solution: "better-sqlite3 (a native module) does not work on Netlify serverless functions. " +
            "Please migrate to a cloud database like Supabase, PlanetScale, Turso, or Neon.",
          environment: {
            netlify: process.env.NETLIFY,
            nodeEnv: process.env.NODE_ENV,
            platform: process.platform,
          },
        },
        { status: 500 }
      )
    }

    let database
    try {
      database = getDb()
    } catch (dbError) {
      console.error("Database connection failed:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : String(dbError),
          hint: "better-sqlite3 may not work on Netlify. Consider using a cloud database.",
        },
        { status: 500 }
      )
    }

    // Check if email already exists
    const existingUser = database.prepare("SELECT id FROM users WHERE email = ?").get(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Create new user
    const insert = database.prepare(`
      INSERT INTO users (name, email, password, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = insert.run(name, email, hashPassword(password), phone || null, role)

    console.log("User created successfully:", { userId: result.lastInsertRowid, role })

    return NextResponse.json({
      userId: result.lastInsertRowid,
      role,
    })
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    }
    console.error("Signup error:", errorDetails)
    return NextResponse.json(
      {
        error: "Server error",
        details: errorDetails.message,
        ...(process.env.NODE_ENV === "development" && { stack: errorDetails.stack }),
      },
      { status: 500 }
    )
  }
}
