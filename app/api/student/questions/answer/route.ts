import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

/**
 * POST /api/student/questions/answer
 * Submit an answer to a question
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, questionId, answerText } = await request.json()

    if (!userId || !questionId || !answerText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const database = getDb()

    // Verify user is a student
    const user = database.prepare("SELECT id FROM users WHERE id = ? AND role = ?").get(userId, "student") as any

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get question details
    const question = database
      .prepare(`
        SELECT q.id, q.question_type, q.correct_answer, q.points, q.course_id
        FROM questions q
        WHERE q.id = ?
      `)
      .get(questionId) as any

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Verify student is enrolled in the course
    const enrollment = database
      .prepare("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?")
      .get(userId, question.course_id) as any

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
    }

    // Check if already answered
    const existingAnswer = database
      .prepare("SELECT id FROM question_answers WHERE question_id = ? AND student_id = ?")
      .get(questionId, userId) as any

    // Calculate points (simple comparison for now)
    let isCorrect = false
    let pointsEarned = 0

    if (question.question_type === "multiple_choice") {
      isCorrect = answerText.trim().toLowerCase() === question.correct_answer?.trim().toLowerCase()
      pointsEarned = isCorrect ? question.points : 0
    } else {
      // For short_answer and essay, give full points (teacher can grade later)
      pointsEarned = question.points
    }

    if (existingAnswer) {
      // Update existing answer
      const update = database.prepare(`
        UPDATE question_answers
        SET answer_text = ?, is_correct = ?, points_earned = ?, submitted_at = CURRENT_TIMESTAMP
        WHERE question_id = ? AND student_id = ?
      `)
      update.run(answerText, isCorrect ? 1 : 0, pointsEarned, questionId, userId)
    } else {
      // Insert new answer
      const insert = database.prepare(`
        INSERT INTO question_answers (question_id, student_id, answer_text, is_correct, points_earned)
        VALUES (?, ?, ?, ?, ?)
      `)
      insert.run(questionId, userId, answerText, isCorrect ? 1 : 0, pointsEarned)
    }

    return NextResponse.json({
      message: "Answer submitted successfully",
      isCorrect,
      pointsEarned,
    })
  } catch (error) {
    console.error("Submit answer error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

