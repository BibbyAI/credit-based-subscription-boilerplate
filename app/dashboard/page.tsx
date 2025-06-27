import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logout } from "./actions";
import { TestApiButtons } from "./test-api-buttons";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ManageSubscriptionButton } from "@/components/manage-subscription-button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { CreditDashboard } from "@/components/credit-dashboard";

interface DashboardPageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;
  const params = await searchParams;
  const successMessage = params.message;

  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Handle database table not existing or RLS issues
  const safeSubscription = subError ? null : subscription;

  console.log("Dashboard data:", {
    user: user.email,
    subscription: safeSubscription?.plan_type,
    subError: subError?.message,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Dashboard" />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {!user.email_confirmed_at && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Please check your email and click the confirmation link to fully
              activate your account.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Credit Dashboard */}
        <div className="mb-8">
          <CreditDashboard />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Account</CardTitle>
              <CardDescription>Account details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Member since{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Email Status
                  </span>
                  <Badge
                    variant={user.email_confirmed_at ? "default" : "secondary"}
                  >
                    {user.email_confirmed_at
                      ? "Verified"
                      : "Pending Verification"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="text-sm font-mono text-foreground">
                    {user.id.slice(0, 8)}...
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Sign In
                  </span>
                  <span className="text-sm text-foreground">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Account Created
                  </span>
                  <span className="text-sm text-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                Your current plan and subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Current Plan
                  </span>
                  <Badge
                    variant={
                      safeSubscription?.plan_type === "PRO"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {safeSubscription?.plan_type || "FREE"}
                  </Badge>
                </div>

                {safeSubscription?.stripe_customer_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge
                      variant={
                        safeSubscription.status === "active"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {safeSubscription.status}
                    </Badge>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  {safeSubscription?.stripe_customer_id ? (
                    <ManageSubscriptionButton userId={user.id} />
                  ) : (
                    <Link href="/pricing">
                      <Button className="w-full">Upgrade Plan</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Testing</CardTitle>
            <CardDescription>Test your API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <TestApiButtons />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
