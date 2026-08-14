import { BANK_TRANSFER, bankTransferRows, paymentReference } from "@/lib/bank";
import { formatMoney } from "@/lib/shop";

/**
 * The maison's account, shown to a buyer who has chosen to settle by transfer.
 *
 * The reference leads and is set apart from the rest: it is the only field that
 * differs per order, the only one a buyer is likely to skip, and the one whose
 * absence turns an arriving payment into an unattributed sum the concierge has
 * to match by hand.
 *
 * Every value is selectable text rather than an image or a styled span — these
 * are numbers people copy into a banking app, and anything that resists being
 * copied gets typed instead, which is how digits get dropped.
 */
export default function BankTransferPanel({
  orderNumber,
  amount,
  currency,
  className = "",
}: {
  orderNumber: string;
  amount: number | null;
  currency: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-zinc-200 bg-[#FAF8F3] p-6 ${className}`}>
      <h4 className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[#5E7495]">
        Payment by bank transfer
      </h4>

      {/* Reference and amount first — the two things that make the payment
          attributable, and the two most often left out. */}
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-600/30 bg-white px-4 py-3">
          <dt className="font-sans text-[0.58rem] font-medium uppercase tracking-[0.2em] text-[#5E7495]">
            Reference — please quote
          </dt>
          <dd className="mt-1 select-text font-serif text-lg tracking-wide text-[#13294B]">
            {paymentReference(orderNumber)}
          </dd>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <dt className="font-sans text-[0.58rem] font-medium uppercase tracking-[0.2em] text-[#5E7495]">
            Amount
          </dt>
          <dd className="mt-1 select-text font-serif text-lg tracking-wide text-[#13294B]">
            {amount == null ? "To be confirmed" : formatMoney(amount, currency)}
          </dd>
        </div>
      </dl>

      <dl className="mt-5 divide-y divide-zinc-200 border-t border-zinc-200">
        {bankTransferRows().map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5">
            <dt className="w-36 shrink-0 font-sans text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[#5E7495]">
              {row.label}
              {row.overseasOnly && (
                <span className="ml-1 normal-case tracking-normal text-[#A9B8D0]">
                  (from abroad)
                </span>
              )}
            </dt>
            <dd className="min-w-0 flex-1 select-text break-words font-body text-[0.9rem] leading-relaxed text-[#13294B]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 font-body text-[0.78rem] leading-relaxed text-[#5E7495]">
        Transfers within {BANK_TRANSFER.country} need only the bank and branch codes; from abroad,
        use the SWIFT code and the bank&rsquo;s address. Your piece is held for you from the moment
        the order is placed — we write again the day the payment reaches us. Any bank charges levied
        by the sending bank are the remitter&rsquo;s.
      </p>
    </div>
  );
}
