"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CheckCircle2, Send } from "lucide-react"

export default function CourseQuestions() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string

  const [userId, setUserId] = useState<string | null>(null)
  const [course, setCourse] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState<number | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("userId")
    const role = localStorage.getItem("role")

    if (!id || role !== "student") {
      router.push("/")
      return
    }

    setUserId(id)
    loadCourseData(id)
  }, [courseId])

  const loadCourseData = async (id: string) => {
    try {
      // Load course info from enrolled courses
      const dashboardResponse = await fetch(`/api/student/dashboard?userId=${id}`)
      const dashboardData = await dashboardResponse.json()
      const foundCourse = dashboardData.courses?.find((c: any) => c.id === parseInt(courseId))
      setCourse(foundCourse)

      // Load questions
      console.log("Loading questions for course:", courseId, "user:", id)
      const questionsResponse = await fetch(`/api/student/courses/${courseId}/questions?userId=${id}`)
      const questionsData = await questionsResponse.json()
      console.log("Questions response:", questionsData)

      if (questionsData.error) {
        console.error("Error loading questions:", questionsData.error, questionsData.details)
        alert(`Error loading questions: ${questionsData.error}`)
        setQuestions([])
      } else {
        setQuestions(questionsData.questions || [])
        console.log(`Loaded ${questionsData.questions?.length || 0} questions`)

        // Pre-fill answered questions
        const initialAnswers: Record<number, string> = {}
        questionsData.questions?.forEach((q: any) => {
          if (q.answered && q.studentAnswer) {
            initialAnswers[q.id] = q.studentAnswer
          }
        })
        setAnswers(initialAnswers)
      }
    } catch (error) {
      console.error("Failed to load course data:", error)
      alert(`Failed to load course data: ${error instanceof Error ? error.message : String(error)}`)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAnswer = async (questionId: number) => {
    if (!userId || !answers[questionId]?.trim()) {
      alert("Please provide an answer")
      return
    }

    setSubmitting(questionId)
    try {
      const response = await fetch("/api/student/questions/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          questionId,
          answerText: answers[questionId],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Reload questions to get updated status
        await loadCourseData(userId)
        if (data.isCorrect) {
          alert(`Correct! You earned ${data.pointsEarned} points.`)
        } else {
          alert(`Answer submitted. You earned ${data.pointsEarned} points.`)
        }
      } else {
        alert(data.error || "Failed to submit answer")
      }
    } catch (error) {
      console.error("Failed to submit answer:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSubmitting(null)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Course not found or you are not enrolled</p>
            <Button onClick={() => router.push("/student/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => router.push("/student/dashboard")} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
              <p className="text-muted-foreground">{course.subject} - Grade {course.grade_level}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">Course Questions</h2>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading questions...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <Card key={question.id} className={question.answered ? "border-green-200" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Question {index + 1} ({question.points} {question.points === 1 ? "point" : "points"})
                      </CardTitle>
                      {question.answered && (
                        <div className="mt-2 flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            Answered - {question.pointsEarned}/{question.points} points
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-lg">{question.question_text}</p>

                  {question.question_type === "multiple_choice" && question.options && (
                    <div className="space-y-3 mb-4">
                      <RadioGroup
                        value={answers[question.id] || ""}
                        onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                        disabled={question.answered}
                      >
                        {question.options.map((option: string, optIndex: number) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${question.id}-opt${optIndex}`} />
                            <Label htmlFor={`q${question.id}-opt${optIndex}`} className="cursor-pointer flex-1">
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {(question.question_type === "short_answer" || question.question_type === "essay") && (
                    <div className="space-y-2 mb-4">
                      <Label>Your Answer</Label>
                      <Textarea
                        placeholder="Enter your answer..."
                        value={answers[question.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                        disabled={question.answered}
                        rows={question.question_type === "essay" ? 6 : 3}
                      />
                    </div>
                  )}

                  {!question.answered && (
                    <Button
                      onClick={() => handleSubmitAnswer(question.id)}
                      disabled={!answers[question.id]?.trim() || submitting === question.id}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitting === question.id ? "Submitting..." : "Submit Answer"}
                    </Button>
                  )}

                  {question.answered && question.studentAnswer && (
                    <div className="mt-4 p-3 bg-muted rounded">
                      <p className="text-sm font-semibold mb-1">Your Answer:</p>
                      <p className="text-sm">{question.studentAnswer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No questions available for this course yet.</p>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  The teacher hasn't added any questions to this course yet.
                </p>
              </CardContent>
            </Card>
          )}
          </div>
        )}
      </main>
    </div>
  )
}

