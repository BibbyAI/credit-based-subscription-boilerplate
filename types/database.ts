export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Credits {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  transaction_type: "purchase" | "usage" | "refund" | "bonus";
  subscription_id: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscription, "id" | "created_at">>;
      };
      credits: {
        Row: Credits;
        Insert: Omit<Credits, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Credits, "id" | "created_at">>;
      };
      credit_transactions: {
        Row: CreditTransaction;
        Insert: Omit<CreditTransaction, "id" | "created_at">;
        Update: Partial<Omit<CreditTransaction, "id" | "created_at">>;
      };
    };
  };
}
