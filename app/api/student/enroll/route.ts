import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

/**
 * POST /api/student/enroll
 * Enroll a student in a course
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, courseId } = await request.json()

    if (!userId || !courseId) {
      return NextResponse.json({ error: "User ID and Course ID required" }, { status: 400 })
    }

    const database = getDb()

    // Verify user is a student
    const user = database.prepare("SELECT id FROM users WHERE id = ? AND role = ?").get(userId, "student") as any

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Verify course exists
    const course = database.prepare("SELECT id FROM courses WHERE id = ?").get(courseId) as any

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = database
      .prepare("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?")
      .get(userId, courseId) as any

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 })
    }

    // Create enrollment
    const insert = database.prepare(`
      INSERT INTO enrollments (student_id, course_id)
      VALUES (?, ?)
    `)

    const result = insert.run(userId, courseId)

    return NextResponse.json({
      enrollmentId: result.lastInsertRowid,
      message: "Successfully enrolled in course",
    })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

