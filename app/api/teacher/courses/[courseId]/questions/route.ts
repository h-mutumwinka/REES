import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

/**
 * GET /api/teacher/courses/[courseId]/questions
 * Get all questions for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> | { courseId: string } }
) {
  try {
    // Handle both Promise and direct params (for Next.js 13+ and 14+)
    const resolvedParams = params instanceof Promise ? await params : params
    const courseId = parseInt(resolvedParams.courseId)

    if (!courseId || isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    const database = getDb()

    // Verify course exists
    const course = database.prepare("SELECT id, teacher_id FROM courses WHERE id = ?").get(courseId) as any

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Get all questions for this course
    const questions = database
      .prepare(`
        SELECT id, question_text, question_type, options, correct_answer, points, order_index, created_at
        FROM questions
        WHERE course_id = ?
        ORDER BY order_index ASC, created_at ASC
      `)
      .all(courseId) as any[]

    // Parse options JSON if it exists
    const questionsWithParsedOptions = questions.map(q => {
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
      }
    })

    return NextResponse.json({
      questions: questionsWithParsedOptions,
    })
  } catch (error) {
    console.error("Get questions error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teacher/courses/[courseId]/questions
 * Create a new question for a course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> | { courseId: string } }
) {
  try {
    // Handle both Promise and direct params (for Next.js 13+ and 14+)
    const resolvedParams = params instanceof Promise ? await params : params
    const courseId = parseInt(resolvedParams.courseId)
    const { questionText, questionType, options, correctAnswer, points, userId } = await request.json()

    if (!courseId || isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    if (!questionText || !questionType || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get next order index
    const lastQuestion = database
      .prepare("SELECT order_index FROM questions WHERE course_id = ? ORDER BY order_index DESC LIMIT 1")
      .get(courseId) as any

    const nextOrderIndex = lastQuestion ? lastQuestion.order_index + 1 : 0

    // Insert question
    const insert = database.prepare(`
      INSERT INTO questions (course_id, question_text, question_type, options, correct_answer, points, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const optionsJson = options ? JSON.stringify(options) : null
    const result = insert.run(
      courseId,
      questionText,
      questionType,
      optionsJson,
      correctAnswer || null,
      points || 1,
      nextOrderIndex
    )

    return NextResponse.json({
      questionId: result.lastInsertRowid,
      message: "Question created successfully",
    })
  } catch (error) {
    console.error("Create question error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

