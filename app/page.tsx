import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl">Welcome to MyApp</h1>
          <p className="mt-8 text-xl text-muted-foreground">Sign up to access your dashboard</p>
          <div className="mt-12 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
