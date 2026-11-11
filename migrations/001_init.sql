CREATE TABLE IF NOT EXISTS merchants (
 id text PRIMARY KEY, email text UNIQUE NOT NULL, name text NOT NULL,
 password_hash text, wallet text, wallet_verified boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash text PRIMARY KEY, merchant_id text NOT NULL REFERENCES merchants(id),
 buyer_id text NOT NULL, role text NOT NULL CHECK(role IN ('merchant','judge','agent')),
 expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS wallet_challenges (
 id text PRIMARY KEY, merchant_id text NOT NULL REFERENCES merchants(id), wallet text NOT NULL,
 message text NOT NULL, expires_at timestamptz NOT NULL, consumed boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS products (
 id text PRIMARY KEY, merchant_id text NOT NULL REFERENCES merchants(id), slug text UNIQUE NOT NULL,
 title text NOT NULL, description text NOT NULL, amount text NOT NULL CHECK(amount ~ '^[1-9][0-9]{0,29}$'),
 artifact text NOT NULL, artifact_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
 id text PRIMARY KEY, merchant_id text NOT NULL REFERENCES merchants(id), buyer_id text NOT NULL, buyer_owner_id text NOT NULL REFERENCES merchants(id),
 product_id text NOT NULL REFERENCES products(id), policy jsonb NOT NULL, fingerprint text NOT NULL,
 state text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,merchant_id)
);
CREATE TABLE IF NOT EXISTS approvals (
 id text PRIMARY KEY, order_id text UNIQUE NOT NULL REFERENCES orders(id), buyer_id text NOT NULL,
 fingerprint text NOT NULL, expires_at timestamptz NOT NULL, consumed_at timestamptz
);
CREATE TABLE IF NOT EXISTS attempts (
 id text PRIMARY KEY, order_id text UNIQUE NOT NULL REFERENCES orders(id), idempotency_key text UNIQUE NOT NULL,
 state text NOT NULL, quote jsonb, deposit_address text UNIQUE, source_tx text UNIQUE,
 provider jsonb, evidence jsonb, poll_count integer NOT NULL DEFAULT 0,
 next_poll_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz,
 last_error text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS settlements (
 id text PRIMARY KEY, attempt_id text UNIQUE NOT NULL REFERENCES attempts(id),
 chain_id integer NOT NULL, tx_hash text NOT NULL, log_index integer NOT NULL,
 proof jsonb NOT NULL, UNIQUE(chain_id,tx_hash,log_index)
);
CREATE TABLE IF NOT EXISTS entitlements (
 id text PRIMARY KEY, order_id text UNIQUE NOT NULL, merchant_id text NOT NULL,
 attempt_id text UNIQUE NOT NULL REFERENCES attempts(id), artifact text NOT NULL, artifact_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), FOREIGN KEY(order_id,merchant_id) REFERENCES orders(id,merchant_id)
);
CREATE TABLE IF NOT EXISTS events (
 id text PRIMARY KEY, order_id text REFERENCES orders(id), kind text NOT NULL,
 external_key text UNIQUE, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS outbox (
 id text PRIMARY KEY, order_id text NOT NULL REFERENCES orders(id), topic text NOT NULL,
 payload jsonb NOT NULL, attempts integer NOT NULL DEFAULT 0, delivered_at timestamptz,
 next_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz, last_error text,
 UNIQUE(order_id,topic)
);
CREATE TABLE IF NOT EXISTS passports (
 order_id text PRIMARY KEY REFERENCES orders(id), document jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS rate_limits (
 key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS attempts_reconcile ON attempts(next_poll_at);
CREATE INDEX IF NOT EXISTS outbox_reconcile ON outbox(next_at) WHERE delivered_at IS NULL;
CREATE INDEX IF NOT EXISTS orders_merchant ON orders(merchant_id,created_at);
