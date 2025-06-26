export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    credits: 100,
    description: "Perfect for getting started",
    features: ["100 credits per month", "Basic support", "Standard API access"],
  },
  PRO: {
    name: "Pro",
    price: 29,
    credits: 100000,
    description: "For power users",
    priceId: "price_pro_monthly",
    features: [
      "100,000 credits per month",
      "Priority support",
      "Advanced API access",
      "Analytics dashboard",
      "Custom integrations",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
