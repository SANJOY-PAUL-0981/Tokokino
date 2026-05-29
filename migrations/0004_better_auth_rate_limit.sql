CREATE TABLE IF NOT EXISTS "rateLimit" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "key" TEXT,
  "count" INTEGER,
  "lastRequest" INTEGER
);

CREATE INDEX IF NOT EXISTS "rateLimit_key_idx" ON "rateLimit" ("key");
