import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const database = getDb()
    const user = database.prepare("SELECT name FROM users WHERE id = ? AND role = ?").get(userId, "admin") as any

    if (!user) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    const totalUsers = (database.prepare("SELECT COUNT(*) as count FROM users").get() as any).count
    const totalStudents = (database.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as any)
      .count
    const totalTeachers = (database.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'").get() as any)
      .count
    const totalCourses = (database.prepare("SELECT COUNT(*) as count FROM courses").get() as any).count

    const users = database.prepare("SELECT id, name, email, role FROM users").all() as any[]

    return NextResponse.json({
      name: user.name,
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalCourses,
      },
      users,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
