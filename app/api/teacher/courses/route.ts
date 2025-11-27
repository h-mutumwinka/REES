import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

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
    console.error("Create course error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
