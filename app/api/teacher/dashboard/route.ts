import { type NextRequest, NextResponse } from "next/server"
import Database from "better-sqlite3"
import path from "path"

let db: Database.Database

function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), "rees.db")
    db = new Database(dbPath)
  }
  return db
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const database = getDb()
    const user = database.prepare("SELECT name FROM users WHERE id = ? AND role = ?").get(userId, "teacher") as any

    if (!user) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const courses = database
      .prepare(`
      SELECT id, title, description, subject, grade_level
      FROM courses
      WHERE teacher_id = ?
    `)
      .all(userId) as any[]

    return NextResponse.json({
      name: user.name,
      courses,
    })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
