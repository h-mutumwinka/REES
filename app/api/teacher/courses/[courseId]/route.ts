import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

/**
 * DELETE /api/teacher/courses/[courseId]
 * Delete a course and all related data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> | { courseId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    // Handle both Promise and direct params (for Next.js 13+ and 14+)
    const resolvedParams = params instanceof Promise ? await params : params
    const courseId = parseInt(resolvedParams.courseId)

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    if (!courseId || isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    const database = getDb()

    // Verify course exists and belongs to the teacher
    const course = database.prepare("SELECT id, teacher_id FROM courses WHERE id = ?").get(courseId) as any

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Ensure both are integers for comparison
    const teacherId = typeof course.teacher_id === 'number' ? course.teacher_id : parseInt(course.teacher_id)
    const userIdInt = parseInt(userId)

    if (teacherId !== userIdInt) {
      return NextResponse.json({ error: "Unauthorized - You can only delete your own courses" }, { status: 403 })
    }

    // Start transaction - delete all related data
    database.exec("BEGIN TRANSACTION")

    try {
      // Delete question answers
      database.prepare("DELETE FROM question_answers WHERE question_id IN (SELECT id FROM questions WHERE course_id = ?)").run(courseId)

      // Delete questions
      database.prepare("DELETE FROM questions WHERE course_id = ?").run(courseId)

      // Delete submissions
      database.prepare("DELETE FROM submissions WHERE material_id IN (SELECT id FROM course_materials WHERE course_id = ?)").run(courseId)

      // Delete progress
      database.prepare("DELETE FROM progress WHERE material_id IN (SELECT id FROM course_materials WHERE course_id = ?)").run(courseId)

      // Delete course materials
      database.prepare("DELETE FROM course_materials WHERE course_id = ?").run(courseId)

      // Delete enrollments
      database.prepare("DELETE FROM enrollments WHERE course_id = ?").run(courseId)

      // Delete the course
      database.prepare("DELETE FROM courses WHERE id = ?").run(courseId)

      database.exec("COMMIT")

      return NextResponse.json({
        message: "Course deleted successfully",
      })
    } catch (error) {
      database.exec("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Delete course error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

