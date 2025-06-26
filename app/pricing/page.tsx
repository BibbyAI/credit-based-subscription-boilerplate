import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SubscribeButton } from "@/components/subscribe-button";
import { createClient } from "@/utils/supabase/server";
import { PLANS } from "@/lib/plans";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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
                <div className="text-3xl font-bold text-foreground">
                  {PLANS.FREE.credits.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  credits per month
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS.FREE.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
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
              <Badge className="bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{PLANS.PRO.name}</CardTitle>
              <CardDescription>{PLANS.PRO.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">
                  ${PLANS.PRO.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6 bg-primary/10 rounded-lg mb-6 border border-primary/20">
                <div className="text-3xl font-bold text-foreground">
                  {PLANS.PRO.credits.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  credits per month
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS.PRO.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-6">
                {user ? (
                  <SubscribeButton
                    priceId={PLANS.PRO.priceId}
                    userId={user.id}
                    email={user.email!}
                    className="w-full"
                  >
                    Start Pro Trial
                  </SubscribeButton>
                ) : (
                  <Link href="/signup">
                    <Button className="w-full">Start Pro Trial</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Have questions?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
