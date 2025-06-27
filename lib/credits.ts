import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database";

type Credits = Database["public"]["Tables"]["credits"]["Row"];
type CreditTransaction =
  Database["public"]["Tables"]["credit_transactions"]["Row"];

export interface CreditResult {
  success: boolean;
  message: string;
  balance?: number;
  transaction?: CreditTransaction;
}

/**
 * Get the current credit balance for a user
 */
export async function getUserCredits(userId: string): Promise<Credits | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user credits:", error);
    return null;
  }

  return data;
}

/**
 * Consume credits for a user (deduct credits)
 */
export async function consumeCredits(
  userId: string,
  amount: number,
  description: string
): Promise<CreditResult> {
  if (amount <= 0) {
    return {
      success: false,
      message: "Amount must be greater than 0",
    };
  }

  const supabase = await createClient();

  try {
    // Start a transaction
    const { data: currentCredits, error: fetchError } = await supabase
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      return {
        success: false,
        message: "Failed to fetch current credits",
      };
    }

    if (!currentCredits || currentCredits.balance < amount) {
      return {
        success: false,
        message: "Insufficient credits",
        balance: currentCredits?.balance || 0,
      };
    }

    // Update credit balance
    const newBalance = currentCredits.balance - amount;
    const { error: updateError } = await supabase
      .from("credits")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (updateError) {
      return {
        success: false,
        message: "Failed to update credit balance",
      };
    }

    // Record transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount: -amount, // Negative for consumption
        description,
        transaction_type: "usage",
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Failed to record transaction:", transactionError);
      // Don't fail the operation if transaction recording fails
    }

    return {
      success: true,
      message: `Successfully consumed ${amount} credits`,
      balance: newBalance,
      transaction: transaction || undefined,
    };
  } catch (error) {
    console.error("Error consuming credits:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

/**
 * Add credits to a user (bonus, purchase, etc.)
 */
export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  transactionType: "purchase" | "bonus" | "refund" = "bonus",
  subscriptionId?: string
): Promise<CreditResult> {
  if (amount <= 0) {
    return {
      success: false,
      message: "Amount must be greater than 0",
    };
  }

  const supabase = await createClient();

  try {
    // Get current balance
    const { data: currentCredits, error: fetchError } = await supabase
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      return {
        success: false,
        message: "Failed to fetch current credits",
      };
    }

    if (!currentCredits) {
      return {
        success: false,
        message: "User credits not found",
      };
    }

    // Update credit balance
    const newBalance = currentCredits.balance + amount;
    const { error: updateError } = await supabase
      .from("credits")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (updateError) {
      return {
        success: false,
        message: "Failed to update credit balance",
      };
    }

    // Record transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount,
        description,
        transaction_type: transactionType,
        subscription_id: subscriptionId,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Failed to record transaction:", transactionError);
      // Don't fail the operation if transaction recording fails
    }

    return {
      success: true,
      message: `Successfully added ${amount} credits`,
      balance: newBalance,
      transaction: transaction || undefined,
    };
  } catch (error) {
    console.error("Error adding credits:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

/**
 * Get credit transaction history for a user
 */
export async function getCreditTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CreditTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching credit transactions:", error);
    return [];
  }

  return data || [];
}

/**
 * Check if a user has enough credits for an operation
 */
export async function hasEnoughCredits(
  userId: string,
  requiredAmount: number
): Promise<boolean> {
  const credits = await getUserCredits(userId);
  return credits ? credits.balance >= requiredAmount : false;
}

/**
 * Get credit usage statistics for a user
 */
export async function getCreditStats(
  userId: string,
  days: number = 30
): Promise<{
  totalUsed: number;
  totalAdded: number;
  transactionCount: number;
}> {
  const supabase = await createClient();
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const { data, error } = await supabase
    .from("credit_transactions")
    .select("amount, transaction_type")
    .eq("user_id", userId)
    .gte("created_at", dateFrom.toISOString());

  if (error) {
    console.error("Error fetching credit stats:", error);
    return { totalUsed: 0, totalAdded: 0, transactionCount: 0 };
  }

  const stats = data.reduce(
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

  return stats;
}
