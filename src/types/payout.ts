/** Payout destinations, mirroring src/db/schema/payouts.ts on the API. */

export type PayoutMethodType = 'bank' | 'upi';

export interface PayoutMethod {
  id: string;
  type: PayoutMethodType;
  label: string | null;
  isDefault: boolean;
  accountHolderName: string | null;
  /** The full account number never leaves the server. */
  accountNumberLast4: string | null;
  ifsc: string | null;
  bankName: string | null;
  upiId: string | null;
  /** Ready-to-render one-liner built by the API. */
  display: string;
  createdAt: string;
}

export type CreatePayoutMethodInput =
  | {
      type: 'bank';
      label?: string | null;
      accountHolderName: string;
      accountNumber: string;
      confirmAccountNumber: string;
      ifsc: string;
      bankName?: string | null;
      makeDefault?: boolean;
    }
  | {
      type: 'upi';
      label?: string | null;
      upiId: string;
      makeDefault?: boolean;
    };

/** RBI format: four letters, a zero, then six alphanumerics. Mirrors the API validator. */
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const ACCOUNT_NUMBER_PATTERN = /^\d{9,18}$/;
export const UPI_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;
