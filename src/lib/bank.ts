/**
 * The maison's bank details, for buyers settling by transfer.
 *
 * Committed rather than read from the environment for the same reason as the
 * contact channels (see lib/contact.ts): these are the published payment
 * instructions a house prints on its own invoice, and `.env.local` is
 * gitignored — an env-only account number silently vanishes on a fresh deploy,
 * taking the checkout's payment instructions with it.
 *
 * ONE definition, read by the order form, the confirmation screen and the
 * confirmation email alike. An account number that appears twice is an account
 * number that will eventually disagree with itself, and a buyer wiring four
 * figures to a stale one has no way to know.
 */

export const BANK_TRANSFER = {
  accountName: "CEYLON GEM MAISON PTE. LTD.",
  accountNumber: "7897205571",
  bankName: "Standard Chartered Bank (Singapore) Limited",
  /** Singapore local transfers are addressed by bank + branch code, not SWIFT. */
  bankCode: "9496",
  branchCode: "001",
  /** Needed only from outside Singapore. */
  swift: "SCBLSG22",
  bankAddress:
    "8 Marina Boulevard #27-01, Marina Bay Financial Centre Tower 1, Singapore",
  country: "Singapore",
} as const;

export type BankRow = {
  label: string;
  value: string;
  /** Marks the rows only an overseas remitter needs, so the panel can say so. */
  overseasOnly?: boolean;
};

/**
 * The account as an ordered list of rows — the single rendering order shared by
 * every surface that shows it, so the web panel and the email cannot drift into
 * listing the same account two different ways.
 */
export function bankTransferRows(): BankRow[] {
  return [
    { label: "Account name", value: BANK_TRANSFER.accountName },
    { label: "Account number", value: BANK_TRANSFER.accountNumber },
    { label: "Bank", value: BANK_TRANSFER.bankName },
    { label: "Bank code", value: BANK_TRANSFER.bankCode },
    { label: "Branch code", value: BANK_TRANSFER.branchCode },
    { label: "SWIFT / BIC", value: BANK_TRANSFER.swift, overseasOnly: true },
    { label: "Bank address", value: BANK_TRANSFER.bankAddress, overseasOnly: true },
  ];
}

/**
 * What the buyer puts in the transfer's reference field. The order number is
 * the only thing tying an arriving payment to a piece — without it the house is
 * matching amounts to names by hand, which is exactly how the wrong order gets
 * marked paid.
 */
export function paymentReference(orderNumber: string): string {
  return orderNumber;
}
