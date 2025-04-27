-- 0) Fuzzy search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Example usage: 
--  SELECT * FROM word
--  WHERE lang_dialect_id = 1
--  ORDER BY spelling <-> 'кыил'
--  LIMIT 10;

-- 1) Trigger function to keep updated_at current
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 2) Enums
CREATE TYPE Language AS ENUM ('Lezgi', 'Tabasaran', 'Russian', 'English', 'Turkish', 'Azerbaijani', 'Persian', 'Arabic');
CREATE TYPE Role     AS ENUM ('Admin', 'Moderator', 'User');


-- 3) Tables

-- lang_dialect
CREATE TABLE lang_dialect (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  language    Language NOT NULL,
  dialect     TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER lang_dialect_ts
  BEFORE UPDATE ON lang_dialect
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- "user"
CREATE TABLE "user" (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT,
  email       TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,
  language    Language,
  verified    BOOLEAN,
  role        Role,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER user_ts
  BEFORE UPDATE ON "user"
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- source
CREATE TABLE source (
  id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name             TEXT    NOT NULL,
  authors          TEXT,
  publication_year TEXT,
  provided_by      TEXT,
  provided_by_url  TEXT,
  processed_by     TEXT,
  copyright        TEXT,
  see_source_url   TEXT,
  description      TEXT,
  created_by       INTEGER    NOT NULL REFERENCES "user"(id),
  updated_by       INTEGER    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER source_ts
  BEFORE UPDATE ON source
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();

-- word
CREATE TABLE word (
  id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  spelling         TEXT    NOT NULL,
  lang_dialect_id  INTEGER NOT NULL REFERENCES lang_dialect(id),
  created_by       INTEGER    NOT NULL REFERENCES "user"(id),
  updated_by       INTEGER    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX word_gin_idx ON word USING gin (spelling gin_trgm_ops);
CREATE TRIGGER word_ts
  BEFORE UPDATE ON word
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- spelling_variant
CREATE TABLE spelling_variant (
  id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lang_dialect_id  INTEGER REFERENCES lang_dialect(id),
  word_id          INTEGER    NOT NULL REFERENCES word(id),
  spelling         TEXT    NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX spelling_variant_gin_idx ON spelling_variant USING gin (spelling gin_trgm_ops);
CREATE TRIGGER spelling_variant_ts
  BEFORE UPDATE ON spelling_variant
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- word_details
CREATE TABLE word_details (
  id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  word_id          INTEGER    NOT NULL REFERENCES word(id),
  order_idx        INT,  -- order of the details per word
  inflection       TEXT,
  lang_dialect_id  INTEGER NOT NULL REFERENCES lang_dialect(id),
  source_id        INTEGER    REFERENCES source(id),
  created_by       INTEGER    NOT NULL REFERENCES "user"(id),
  updated_by       INTEGER    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER word_details_ts
  BEFORE UPDATE ON word_details
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- definition
CREATE TABLE definition (
  id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  word_details_id    INTEGER    REFERENCES word_details(id),
  values             JSON[],
  tags               TEXT[],
  created_by         INTEGER    NOT NULL REFERENCES "user"(id),
  updated_by         INTEGER    NOT NULL REFERENCES "user"(id),
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER definition_ts
  BEFORE UPDATE ON definition
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();

-- translations
CREATE TABLE translations (
  id                    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  phrases_per_lang_dialect JSONB,
  tags                  TEXT[],
  raw                   TEXT,
  created_by            INTEGER    NOT NULL REFERENCES "user"(id),
  updated_by            INTEGER    NOT NULL REFERENCES "user"(id),
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER translations_ts
  BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();

-- word_details_example
CREATE TABLE word_details_example (
  word_details_id  INTEGER    NOT NULL REFERENCES word_details(id),
  translation_id   INTEGER    NOT NULL REFERENCES translations(id),
  created_by       INTEGER    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (word_details_id, translation_id)
);


-- definition_example
CREATE TABLE definition_example (
  definition_id    INTEGER    NOT NULL REFERENCES definition(id),
  translation_id   INTEGER    NOT NULL REFERENCES translations(id),
  created_by       INTEGER    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (definition_id, translation_id)
);



-- materialized view for fast lookups
-- DROP MATERIALIZED VIEW IF EXISTS mv_word_definition_translation;

CREATE MATERIALIZED VIEW mv_word_definition_translation AS
  /* Translations attached to definitions */
  SELECT
    wd.word_id,
    def.id             AS definition_id,
    de.translation_id
    w.lang_dialect_id AS word_lang_dialect_id,
    wd.lang_dialect_id AS definitions_lang_dialect_id,
  FROM word_details wd
  JOIN word w
    ON wd.word_id = w.id
  JOIN definition def
    ON wd.id = def.word_details_id
  JOIN definition_example de
    ON def.id = de.definition_id

  UNION ALL

  /* Translations attached directly to word_details */
  SELECT
    wd.word_id,
    NULL::INTEGER        AS definition_id,
    wde.translation_id
    w.lang_dialect_id AS word_lang_dialect_id,
    wd.lang_dialect_id AS definitions_lang_dialect_id,
  FROM word_details wd
  JOIN word w
    ON wd.word_id = w.id
  JOIN word_details_example wde
    ON wd.id = wde.word_details_id
WITH NO DATA;  -- fill on first REFRESH