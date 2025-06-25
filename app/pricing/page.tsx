import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-xl font-bold text-foreground">MyApp</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6 bg-muted/50 rounded-lg mb-6">
                <div className="text-3xl font-bold text-foreground">100</div>
                <div className="text-sm text-muted-foreground">credits per month</div>
              </div>
              <div className="pt-6">
                <Link href="/signup">
                  <Button variant="outline" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For power users</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6 bg-primary/10 rounded-lg mb-6 border border-primary/20">
                <div className="text-3xl font-bold text-foreground">100,000</div>
                <div className="text-sm text-muted-foreground">credits per month</div>
              </div>
              <div className="pt-6">
                <Link href="/signup">
                  <Button className="w-full">
                    Start Pro Trial
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Have questions? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
          </p>
        </div>
      </main>
    </div>
  )
} 