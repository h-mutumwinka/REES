import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

/**
 * GET /api/student/courses/[courseId]/questions
 * Get all questions for a course (for students to answer)
 */
export async function GET(
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

    // Verify user is a student
    const user = database.prepare("SELECT id FROM users WHERE id = ? AND role = ?").get(userId, "student") as any

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Verify student is enrolled in the course
    const enrollment = database
      .prepare("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?")
      .get(userId, courseId) as any

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
    }

    // Get all questions for this course
    const questions = database
      .prepare(`
        SELECT id, question_text, question_type, options, points, order_index
        FROM questions
        WHERE course_id = ?
        ORDER BY order_index ASC, created_at ASC
      `)
      .all(courseId) as any[]

    console.log(`Found ${questions.length} questions for course ${courseId}`)

    // Get student's answers
    const answers = database
      .prepare(`
        SELECT question_id, answer_text, points_earned
        FROM question_answers
        WHERE student_id = ?
      `)
      .all(userId) as any[]

    const answersMap = new Map(answers.map(a => [a.question_id, a]))

    // Parse options JSON and add answer status
    const questionsWithAnswers = questions.map(q => {
      const answer = answersMap.get(q.id)
      let parsedOptions = null
      if (q.options) {
        try {
          parsedOptions = JSON.parse(q.options)
        } catch (e) {
          console.error("Error parsing options JSON:", e, q.options)
          parsedOptions = null
        }
      }
      return {
        ...q,
        options: parsedOptions,
        answered: !!answer,
        studentAnswer: answer?.answer_text || null,
        pointsEarned: answer?.points_earned || 0,
      }
    })

    return NextResponse.json({
      questions: questionsWithAnswers,
    })
  } catch (error) {
    console.error("Get questions error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

