import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const database = getDb()
    const user = database.prepare("SELECT name FROM users WHERE id = ? AND role = ?").get(userId, "student") as any

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const courses = database
      .prepare(`
      SELECT c.id, c.title, c.description, c.subject, c.grade_level
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = ?
    `)
      .all(userId) as any[]

    return NextResponse.json({
      name: user.name,
      courses,
    })
  } catch (error) {
    console.error("Student dashboard error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
