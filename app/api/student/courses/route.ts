import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

/**
 * GET /api/student/courses
 * Get all available courses that students can enroll in
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const database = getDb()
    
    // Verify user is a student
    const user = database.prepare("SELECT id, name FROM users WHERE id = ? AND role = ?").get(userId, "student") as any

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get all courses with teacher information
    const allCourses = database
      .prepare(`
        SELECT 
          c.id, 
          c.title, 
          c.description, 
          c.subject, 
          c.grade_level,
          c.created_at,
          u.name as teacher_name
        FROM courses c
        JOIN users u ON c.teacher_id = u.id
        ORDER BY c.created_at DESC
      `)
      .all() as any[]

    // Get enrolled course IDs for this student
    const enrolledCourses = database
      .prepare("SELECT course_id FROM enrollments WHERE student_id = ?")
      .all(userId) as any[]
    
    const enrolledCourseIds = new Set(enrolledCourses.map(e => e.course_id))

    // Mark which courses are enrolled
    const courses = allCourses.map(course => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course.id),
    }))

    return NextResponse.json({
      courses,
    })
  } catch (error) {
    console.error("Get courses error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

