import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { logout } from "@/app/dashboard/actions"

interface NavbarProps {
  title?: string
}

export async function Navbar({ title = "MyApp" }: NavbarProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"}>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/pricing">
              <Button variant="ghost" size="sm">Pricing</Button>
            </Link>
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <form>
                  <Button formAction={logout} variant="outline" size="sm">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 