-- This scripts should be executed on prod db before rolling any new update related or unrelated to the dashboard

DROP TABLE proposal; 
--CREATE TYPE ProposalType AS ENUM ('source','dictionary','translations');
CREATE TABLE proposal (
  id                SERIAL PRIMARY KEY,
  type              ProposalType NOT NULL,
  data              JSONB      NOT NULL,
  proposed_by       INTEGER    NOT NULL REFERENCES "user"(id),
  proposed_at       TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status            ProposalStatus NOT NULL DEFAULT 'pending',
  comment			TEXT	   NULL,
  reviewed_by       INTEGER    NULL REFERENCES "user"(id),
  reviewed_at       TIMESTAMP  NULL
);

-- =========================================================
-- JSONB stuff --
-- =========================================================
-- json[]  ->  jsonb (single JSONB array)
ALTER TABLE definition 
  ALTER COLUMN "values" TYPE jsonb
  USING COALESCE(array_to_json("values")::jsonb, '[]'::jsonb);

-- Optional niceties
ALTER TABLE definition 
  ALTER COLUMN "values" SET DEFAULT '[]'::jsonb,
  ALTER COLUMN "values" SET NOT NULL;

-- json[]  ->  jsonb (single JSONB array)
ALTER TABLE history_definition 
  ALTER COLUMN "values" TYPE jsonb
  USING COALESCE(array_to_json("values")::jsonb, '[]'::jsonb);

-- Optional niceties
ALTER TABLE history_definition 
  ALTER COLUMN "values" SET DEFAULT '[]'::jsonb,
  ALTER COLUMN "values" SET NOT NULL;

-- =========================================================

-- remove unused columns
ALTER TABLE public.definition_example DROP CONSTRAINT IF EXISTS definition_example_created_by_fkey;
ALTER TABLE public.definition_example DROP COLUMN IF EXISTS created_by;

ALTER TABLE public.word_details_example DROP CONSTRAINT IF EXISTS word_details_example_created_by_fkey;
ALTER TABLE public.word_details_example DROP COLUMN IF EXISTS created_by;

ALTER TABLE public.history_definition_example DROP COLUMN IF EXISTS created_by CASCADE;
ALTER TABLE public.history_word_details_example DROP COLUMN IF EXISTS created_by CASCADE;

CREATE OR REPLACE FUNCTION history_word_details_example_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  full_row history_word_details_example;
BEGIN
  SELECT
    OLD.word_details_id, OLD.translation_id,
    OLD.created_at,
    OLD.created_at, CURRENT_TIMESTAMP -- valid_from, valid_to
  INTO full_row;

  BEGIN
    INSERT INTO history_word_details_example OVERRIDING SYSTEM VALUE VALUES (full_row.*);
  EXCEPTION WHEN unique_violation THEN
    -- Ignore duplicate history row
  END;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION history_definition_example_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  full_row history_definition_example;
BEGIN
  SELECT
    OLD.definition_id, OLD.translation_id,
    OLD.created_at,
    OLD.created_at, CURRENT_TIMESTAMP -- valid_from, valid_to
  INTO full_row;

  BEGIN
    INSERT INTO history_definition_example OVERRIDING SYSTEM VALUE VALUES (full_row.*);
  EXCEPTION WHEN unique_violation THEN
    -- Ignore duplicate history row
  END;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


-- Add created_by and updated_by to the spelling_variant table
BEGIN;

-- 1) Add the columns nullable first
ALTER TABLE spelling_variant
  ADD COLUMN created_by integer,
  ADD COLUMN updated_by integer;

-- 2) Backfill existing rows (use your real fallback user id)
WITH fallback AS (SELECT 1::int AS uid)
UPDATE spelling_variant sv
SET created_by = COALESCE(sv.created_by, f.uid),
    updated_by = COALESCE(sv.updated_by, f.uid)
FROM fallback f
WHERE sv.created_by IS NULL OR sv.updated_by IS NULL;

-- 3) Add FKs (NOT VALID keeps the lock short), then validate
ALTER TABLE spelling_variant
  ADD CONSTRAINT spelling_variant_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES "user"(id) NOT VALID,
  ADD CONSTRAINT spelling_variant_updated_by_fkey
    FOREIGN KEY (updated_by) REFERENCES "user"(id) NOT VALID;

ALTER TABLE spelling_variant
  VALIDATE CONSTRAINT spelling_variant_created_by_fkey;
ALTER TABLE spelling_variant
  VALIDATE CONSTRAINT spelling_variant_updated_by_fkey;

-- 4) Enforce NOT NULL
ALTER TABLE spelling_variant
  ALTER COLUMN created_by SET NOT NULL,
  ALTER COLUMN updated_by SET NOT NULL;

COMMIT;
