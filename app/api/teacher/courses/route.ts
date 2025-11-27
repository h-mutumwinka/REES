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

export async function POST(request: NextRequest) {
  try {
    const { userId, title, subject, gradeLevel, description } = await request.json()

    if (!userId || !title || !subject || !gradeLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const database = getDb()
    const insert = database.prepare(`
      INSERT INTO courses (title, description, subject, grade_level, teacher_id)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = insert.run(title, description || "", subject, gradeLevel, userId)

    return NextResponse.json({
      id: result.lastInsertRowid,
      message: "Course created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
