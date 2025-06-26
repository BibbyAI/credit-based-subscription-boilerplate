export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan_type: "FREE" | "PRO";
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscription, "id" | "created_at">>;
      };
      user_credits: {
        Row: UserCredits;
        Insert: Omit<UserCredits, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserCredits, "id" | "created_at">>;
      };
    };
  };
}
