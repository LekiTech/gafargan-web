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

-- json[]  ->  jsonb (single JSONB array)
ALTER TABLE definition 
  ALTER COLUMN "values" TYPE jsonb
  USING COALESCE(array_to_json("values")::jsonb, '[]'::jsonb);

-- Optional niceties
ALTER TABLE definition 
  ALTER COLUMN "values" SET DEFAULT '[]'::jsonb,
  ALTER COLUMN "values" SET NOT NULL;