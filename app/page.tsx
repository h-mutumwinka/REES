"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                REES
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Rural Education Empowerment System</h1>
                <p className="text-sm text-muted-foreground">Quality education for rural communities</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">Transform Education Access</h2>
              <p className="text-lg text-muted-foreground mb-6">
                REES connects students, teachers, and administrators in rural Rwanda with quality educational resources
                and training programs.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: "📚", title: "Rich Content", description: "Access lessons, videos, and training materials" },
                { icon: "📊", title: "Track Progress", description: "Monitor learning outcomes and performance" },
                { icon: "👥", title: "Collaborate", description: "Teachers and students work together seamlessly" },
              ].map((item) => (
                <Card key={item.title} className="border border-border">
                  <CardContent className="flex gap-4 pt-4">
                    <div className="text-3xl">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div>
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Sign in to your account or create a new one</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-6">
                    <LoginForm />
                  </TabsContent>

                  <TabsContent value="signup" className="mt-6">
                    <SignupForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
