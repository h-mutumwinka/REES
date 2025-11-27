"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut } from "lucide-react"

export default function TeacherDashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [teacherName, setTeacherName] = useState("")
  const [courses, setCourses] = useState<any[]>([])
  const [newCourse, setNewCourse] = useState({ title: "", subject: "", gradeLevel: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem("userId")
    const role = localStorage.getItem("role")

    if (!id || role !== "teacher") {
      router.push("/")
      return
    }

    setUserId(id)
    loadTeacherData(id)
  }, [router])

  const loadTeacherData = async (id: string) => {
    try {
      const response = await fetch(`/api/teacher/dashboard?userId=${id}`)
      const data = await response.json()
      setTeacherName(data.name)
      setCourses(data.courses || [])
    } catch (error) {
      console.error("Failed to load teacher data:", error)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: newCourse.title,
          subject: newCourse.subject,
          gradeLevel: newCourse.gradeLevel,
          description: newCourse.description,
        }),
      })

      if (response.ok) {
        setNewCourse({ title: "", subject: "", gradeLevel: "", description: "" })
        loadTeacherData(userId)
      }
    } catch (error) {
      console.error("Failed to create course:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">REES Teacher Portal</h1>
            <p className="text-muted-foreground">Welcome, {teacherName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="create">Create Course</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {courses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        {course.subject} - Grade {course.grade_level}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                      <Button
                        className="w-full mt-4 bg-primary hover:bg-primary/90"
                        onClick={() => router.push(`/teacher/courses/${course.id}`)}
                      >
                        Manage Course
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">You haven't created any courses yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Course</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Introduction to Mathematics"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics"
                        value={newCourse.subject}
                        onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gradeLevel">Grade Level</Label>
                      <Input
                        id="gradeLevel"
                        placeholder="e.g., 9"
                        value={newCourse.gradeLevel}
                        onChange={(e) => setNewCourse({ ...newCourse, gradeLevel: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Describe the course content"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Course"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
