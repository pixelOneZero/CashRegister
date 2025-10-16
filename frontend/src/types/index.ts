export interface ChangeRequest {
  amount_owed: number;
  amount_paid: number;
  locale: 'en-US' | 'fr-FR';
  divisor: number;
}

export interface ChangeResponse {
  change_amount: number;
  change_cents: number;
  denominations: Record<string, number>;
  formatted_change: string;
  is_random: boolean;
  locale: 'en-US' | 'fr-FR';
}


export interface Transaction {
  id: string;
  amount_owed: number;
  amount_paid: number;
  locale: 'en-US' | 'fr-FR';
  divisor: number;
  result?: ChangeResponse;
}

export interface SupportedLocales {
  locales: string[];
  default: string;
}
