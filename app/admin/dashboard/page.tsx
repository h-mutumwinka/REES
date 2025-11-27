"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("")
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalStudents: 0, totalTeachers: 0 })
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const id = localStorage.getItem("userId")
    const role = localStorage.getItem("role")

    if (!id || role !== "admin") {
      router.push("/")
      return
    }

    loadAdminData(id)
  }, [router])

  const loadAdminData = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/dashboard?userId=${id}`)
      const data = await response.json()
      setAdminName(data.name)
      setStats(data.stats)
      setUsers(data.users || [])
    } catch (error) {
      console.error("Failed to load admin data:", error)
    } finally {
      setIsLoading(false)
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
            <h1 className="text-2xl font-bold text-foreground">REES Admin Dashboard</h1>
            <p className="text-muted-foreground">System Administrator - {adminName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, color: "bg-primary" },
            { label: "Students", value: stats.totalStudents, color: "bg-accent" },
            { label: "Teachers", value: stats.totalTeachers, color: "bg-secondary" },
            { label: "Courses", value: stats.totalCourses, color: "bg-chart-1" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className={`${stat.color} text-white rounded-lg p-4 text-center mb-2`}>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </div>
                <p className="text-center text-muted-foreground text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Key metrics and system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">System is operating normally. All services are active.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users and roles</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {user.role}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No users found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Approve and manage educational content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Content management features coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
