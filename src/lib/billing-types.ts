export const MONTHLY_USD = 12;
export const YEARLY_USD = 99;

export type BillingSource = "stripe" | "unlocked";
export type PriceInterval = "month" | "year";

export interface Entitlements {
  pro: boolean;
  checkoutEnabled: boolean;
  portalEnabled: boolean;
  interval: PriceInterval | null;
  status: string | null;
  source: BillingSource;
}
