-- 0015_payment_method.sql — how the buyer said they would settle.
--
-- Still no gateway (see 0010): money arrives when it arrives and the concierge
-- marks `payment_status` by hand. What was missing was the buyer's stated
-- intent, which is a different fact from whether they have paid — an order
-- awaiting a wire against its own order number is worked differently from one
-- the house has to invoice, and until now the dashboard could not tell them
-- apart.
--
-- 'invoice' is the default because it is what every existing order was: placed
-- before the transfer option existed, to be invoiced by hand. Backfilling them
-- as 'transfer' would tell the concierge to go looking for money nobody was
-- ever asked to send.

alter table public.orders
  add column if not exists payment_method text not null default 'invoice';

-- Added separately and idempotently: `add column` cannot be re-run with an
-- inline constraint, and this migration has to survive a second application.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_payment_method_check'
  ) then
    alter table public.orders
      add constraint orders_payment_method_check
      check (payment_method in ('invoice', 'transfer'));
  end if;
end $$;

-- The concierge's working question is "who owes us a transfer?", so the index
-- covers the method together with whether it has landed.
create index if not exists orders_payment_method_idx
  on public.orders (payment_method, payment_status);

comment on column public.orders.payment_method is
  'How the buyer said they would settle: invoice (house raises one) or transfer (buyer wires against the order number). Not proof of payment — see payment_status.';
