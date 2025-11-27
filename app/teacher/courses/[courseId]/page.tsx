"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ManageCourse() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string

  const [userId, setUserId] = useState<string | null>(null)
  const [course, setCourse] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "multiple_choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 1,
  })

  useEffect(() => {
    const id = localStorage.getItem("userId")
    const role = localStorage.getItem("role")

    if (!id || role !== "teacher") {
      router.push("/")
      return
    }

    setUserId(id)
    if (id) {
      loadCourseData(id)
    }
  }, [courseId])

  const loadCourseData = async (id: string) => {
    try {
      // Load course info
      const courseResponse = await fetch(`/api/teacher/dashboard?userId=${id}`)
      const courseData = await courseResponse.json()
      const foundCourse = courseData.courses?.find((c: any) => c.id === parseInt(courseId))
      setCourse(foundCourse)

      // Load questions
      console.log("Loading questions for course:", courseId)
      const questionsResponse = await fetch(`/api/teacher/courses/${courseId}/questions`)
      const questionsData = await questionsResponse.json()
      console.log("Questions loaded:", questionsData)
      
      if (questionsData.error) {
        console.error("Error loading questions:", questionsData.error)
        setQuestions([])
      } else {
        setQuestions(questionsData.questions || [])
      }
    } catch (error) {
      console.error("Failed to load course data:", error)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      alert("User ID not found. Please refresh the page.")
      return
    }

    // Validate required fields
    if (!newQuestion.questionText.trim()) {
      alert("Please enter a question")
      return
    }

    if (newQuestion.questionType === "multiple_choice") {
      const validOptions = newQuestion.options.filter(opt => opt.trim() !== "")
      if (validOptions.length < 2) {
        alert("Please provide at least 2 options for multiple choice question")
        return
      }
      if (!newQuestion.correctAnswer.trim()) {
        alert("Please specify the correct answer")
        return
      }
    }

    try {
      console.log("Creating question:", {
        courseId,
        userId,
        questionText: newQuestion.questionText,
        questionType: newQuestion.questionType,
      })

      const response = await fetch(`/api/teacher/courses/${courseId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          questionText: newQuestion.questionText,
          questionType: newQuestion.questionType,
          options: newQuestion.questionType === "multiple_choice" ? newQuestion.options.filter(opt => opt.trim() !== "") : null,
          correctAnswer: newQuestion.correctAnswer,
          points: newQuestion.points,
        }),
      })

      const data = await response.json()
      console.log("Create question response:", response.status, data)

      if (response.ok) {
        setNewQuestion({
          questionText: "",
          questionType: "multiple_choice",
          options: ["", "", "", ""],
          correctAnswer: "",
          points: 1,
        })
        setShowAddQuestion(false)
        // Reload questions
        if (userId) {
          await loadCourseData(userId)
        }
        alert("Question created successfully!")
      } else {
        alert(data.error || data.details || "Failed to create question")
      }
    } catch (error) {
      console.error("Failed to create question:", error)
      alert(`Failed to create question: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDeleteCourse = async () => {
    if (!userId) {
      alert("User ID not found. Please log in again.")
      return
    }

    try {
      console.log("Deleting course:", courseId, "for user:", userId)
      const response = await fetch(`/api/teacher/courses/${courseId}?userId=${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("Delete response:", response.status, data)

      if (response.ok) {
        alert("Course deleted successfully")
        router.push("/teacher/dashboard")
      } else {
        alert(data.error || data.details || "Failed to delete course")
      }
    } catch (error) {
      console.error("Failed to delete course:", error)
      alert(`An error occurred while deleting the course: ${error instanceof Error ? error.message : String(error)}`)
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
            <p>Course not found</p>
            <Button onClick={() => router.push("/teacher/dashboard")} className="mt-4">
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
              <Button variant="ghost" onClick={() => router.push("/teacher/dashboard")} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
              <p className="text-muted-foreground">{course.subject} - Grade {course.grade_level}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Course
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Delete Course?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="pt-2">
                    Are you sure you want to delete <strong>{course.title}</strong>? This action will permanently delete:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All questions and answers</li>
                      <li>All student enrollments</li>
                      <li>All student submissions and progress</li>
                    </ul>
                    <p className="mt-3 font-semibold text-destructive">This action cannot be undone.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async (e) => {
                      e.preventDefault()
                      await handleDeleteCourse()
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Course
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Course Questions</h2>
          <Button onClick={() => setShowAddQuestion(!showAddQuestion)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {showAddQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter your question..."
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={newQuestion.questionType}
                      onValueChange={(value) =>
                        setNewQuestion({ ...newQuestion, questionType: value, options: ["", "", "", ""] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Points</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                {newQuestion.questionType === "multiple_choice" && (
                  <>
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options]
                              newOptions[index] = e.target.value
                              setNewQuestion({ ...newQuestion, options: newOptions })
                            }}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Input
                        placeholder="Enter the correct answer (must match one of the options)"
                        value={newQuestion.correctAnswer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {newQuestion.questionType !== "multiple_choice" && (
                  <div className="space-y-2">
                    <Label>Correct Answer (Optional - for reference)</Label>
                    <Textarea
                      placeholder="Enter the expected answer..."
                      value={newQuestion.correctAnswer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Create Question
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddQuestion(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Question {index + 1} ({question.points} {question.points === 1 ? "point" : "points"})
                      </CardTitle>
                      <CardDescription className="mt-2">{question.question_type.replace("_", " ")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{question.question_text}</p>

                  {question.question_type === "multiple_choice" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded border ${
                            option === question.correct_answer ? "bg-green-50 border-green-200" : ""
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {option === question.correct_answer && (
                            <span className="ml-2 text-green-600 font-semibold">(Correct)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type !== "multiple_choice" && question.correct_answer && (
                    <div className="mt-4 p-3 bg-muted rounded">
                      <p className="text-sm font-semibold mb-1">Expected Answer:</p>
                      <p className="text-sm">{question.correct_answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No questions yet. Create your first question!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

