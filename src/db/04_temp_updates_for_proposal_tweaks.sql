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
ALTER TABLE public.definition_example DROP CONSTRAINT definition_example_created_by_fkey;
ALTER TABLE public.definition_example DROP COLUMN created_by;

ALTER TABLE public.word_details_example DROP CONSTRAINT word_details_example_created_by_fkey;
ALTER TABLE public.word_details_example DROP COLUMN created_by;