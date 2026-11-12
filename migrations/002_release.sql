ALTER TABLE attempts ADD COLUMN IF NOT EXISTS preflight jsonb;
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS source_receipt jsonb;
