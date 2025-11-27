"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, BookOpen, CheckCircle2 } from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState("")
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<number | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("userId")
    const role = localStorage.getItem("role")

    if (!id || role !== "student") {
      router.push("/")
      return
    }

    setUserId(id)
    loadStudentData(id)
    loadAvailableCourses(id)
  }, [router])

  const loadStudentData = async (id: string) => {
    try {
      const response = await fetch(`/api/student/dashboard?userId=${id}`)
      const data = await response.json()
      setStudentName(data.name)
      setEnrolledCourses(data.courses || [])
    } catch (error) {
      console.error("Failed to load student data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableCourses = async (id: string) => {
    try {
      const response = await fetch(`/api/student/courses?userId=${id}`)
      const data = await response.json()
      setAvailableCourses(data.courses || [])
    } catch (error) {
      console.error("Failed to load available courses:", error)
    }
  }

  const handleEnroll = async (courseId: number) => {
    if (!userId) return

    setEnrolling(courseId)
    try {
      const response = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to enroll in course")
        return
      }

      // Refresh both lists
      await loadStudentData(userId)
      await loadAvailableCourses(userId)
    } catch (error) {
      console.error("Enrollment error:", error)
      alert("An error occurred while enrolling. Please try again.")
    } finally {
      setEnrolling(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
    router.push("/")
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">REES Student Portal</h1>
            <p className="text-muted-foreground">Welcome back, {studentName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="available" className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">Available Courses</TabsTrigger>
            <TabsTrigger value="enrolled">My Courses</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Browse and Enroll in Courses</h2>
              <p className="text-muted-foreground">Select courses to enroll and start learning</p>
            </div>
            {availableCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCourses.map((course) => (
                  <Card key={course.id} className="hover:border-primary transition">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>
                        {course.subject} - Grade {course.grade_level}
                      </CardDescription>
                      {course.teacher_name && (
                        <p className="text-xs text-muted-foreground mt-1">Teacher: {course.teacher_name}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {course.description || "No description available"}
                      </p>
                      {course.isEnrolled ? (
                        <Button className="w-full" variant="outline" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Enrolled
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrolling === course.id}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          {enrolling === course.id ? "Enrolling..." : "Enroll Now"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No courses available at the moment. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            {enrolledCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="cursor-pointer hover:border-primary transition">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>
                        {course.subject} - Grade {course.grade_level}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => router.push(`/student/courses/${course.id}`)}
                      >
                        View Course & Answer Questions
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    You haven't enrolled in any courses yet. Go to "Available Courses" to browse and enroll.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Track your course completion and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Progress data will appear as you complete course materials.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
