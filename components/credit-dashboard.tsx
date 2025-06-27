"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Credits {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  transaction_type: "purchase" | "usage" | "refund" | "bonus";
  subscription_id: string | null;
  created_at: string;
}

interface CreditStatsType {
  totalUsed: number;
  totalAdded: number;
  transactionCount: number;
}

export function CreditDashboard() {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState<CreditStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditData();
  }, []);

  const fetchCreditData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Not authenticated");
        return;
      }

      // Fetch credits
      const { data: creditsData, error: creditsError } = await supabase
        .from("credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (creditsError) {
        setError("Failed to fetch credits");
        return;
      }

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

      if (transactionsError) {
        console.error("Failed to fetch transactions:", transactionsError);
      }

      // Calculate stats (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: statsData, error: statsError } = await supabase
        .from("credit_transactions")
        .select("amount, transaction_type")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (!statsError && statsData) {
        const calculatedStats = statsData.reduce(
          (acc, transaction) => {
            if (transaction.amount < 0) {
              acc.totalUsed += Math.abs(transaction.amount);
            } else {
              acc.totalAdded += transaction.amount;
            }
            acc.transactionCount++;
            return acc;
          },
          { totalUsed: 0, totalAdded: 0, transactionCount: 0 }
        );
        setStats(calculatedStats);
      }

      setCredits(creditsData);
      setTransactions(transactionsData || []);
    } catch (err) {
      console.error("Error fetching credit data:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-blue-100 text-blue-800";
      case "usage":
        return "bg-red-100 text-red-800";
      case "refund":
        return "bg-yellow-100 text-yellow-800";
      case "bonus":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button onClick={fetchCreditData} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credits?.balance?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Available credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Used (30 days)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalUsed?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Credits consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Added (30 days)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalAdded?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Credits received</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest credit activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(
                      transaction.transaction_type,
                      transaction.amount
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className={getTransactionTypeColor(
                        transaction.transaction_type
                      )}
                    >
                      {transaction.transaction_type}
                    </Badge>
                    <span
                      className={`font-mono text-sm font-medium ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
