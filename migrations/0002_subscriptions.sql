-- Per-user Stripe subscription state. user_id is Better Auth text, never UUID.
create table if not exists subscriptions (
  user_id text primary key,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  status text not null default 'inactive',
  price_interval text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_id_idx
  on subscriptions (stripe_customer_id);
