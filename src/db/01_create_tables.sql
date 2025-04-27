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
  language    Language,
  dialect     TEXT     NOT NULL UNIQUE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER lang_dialect_ts
  BEFORE UPDATE ON lang_dialect
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- "user"
CREATE TABLE "user" (
  id          UUID    PRIMARY KEY,
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
  id               UUID    PRIMARY KEY,
  name             TEXT    NOT NULL,
  authors          TEXT,
  publication_year TEXT,
  provided_by      TEXT,
  provided_by_url  TEXT,
  processed_by     TEXT,
  copyright        TEXT,
  see_source_url   TEXT,
  description      TEXT,
  created_by       UUID    NOT NULL REFERENCES "user"(id),
  updated_by       UUID    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER source_ts
  BEFORE UPDATE ON source
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();

-- word
CREATE TABLE word (
  id               UUID    PRIMARY KEY,
  spelling         TEXT    NOT NULL,
  lang_dialect_id  INTEGER NOT NULL REFERENCES lang_dialect(id),
  created_by       UUID    NOT NULL REFERENCES "user"(id),
  updated_by       UUID    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER word_ts
  BEFORE UPDATE ON word
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- spelling_variant
CREATE TABLE spelling_variant (
  id               UUID    PRIMARY KEY,
  lang_dialect_id  INTEGER REFERENCES lang_dialect(id),
  word_id          UUID    NOT NULL REFERENCES word(id),
  spelling         TEXT    NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER spelling_variant_ts
  BEFORE UPDATE ON spelling_variant
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- word_details
CREATE TABLE word_details (
  id               UUID    PRIMARY KEY,
  word_id          UUID    NOT NULL REFERENCES word(id),
  order_idx        INT,  -- order of the details per word
  inflection       TEXT,
  lang_dialect_id  INTEGER NOT NULL REFERENCES lang_dialect(id),
  source_id        UUID    REFERENCES source(id),
  created_by       UUID    NOT NULL REFERENCES "user"(id),
  updated_by       UUID    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER word_details_ts
  BEFORE UPDATE ON word_details
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- definition
CREATE TABLE definition (
  id                 UUID    PRIMARY KEY,
  word_details_id    UUID    REFERENCES word_details(id),
  values             JSON[],
  tags               TEXT[],
  created_by         UUID    NOT NULL REFERENCES "user"(id),
  updated_by         UUID    NOT NULL REFERENCES "user"(id),
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER definition_ts
  BEFORE UPDATE ON definition
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();

-- translations
CREATE TABLE translations (
  id                    UUID    PRIMARY KEY,
  phrases_per_lang_dialect JSONB,
  tags                  TEXT[],
  raw                   TEXT,
  created_by            UUID    NOT NULL REFERENCES "user"(id),
  updated_by            UUID    NOT NULL REFERENCES "user"(id),
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER translations_ts
  BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();

-- word_details_example
CREATE TABLE word_details_example (
  word_details_id  UUID    NOT NULL REFERENCES word_details(id),
  translation_id   UUID    NOT NULL REFERENCES translations(id),
  created_by       UUID    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (word_details_id, translation_id)
);


-- definition_example
CREATE TABLE definition_example (
  definition_id    UUID    NOT NULL REFERENCES definition(id),
  translation_id   UUID    NOT NULL REFERENCES translations(id),
  created_by       UUID    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (definition_id, translation_id)
);



-- materialized view for fast lookups
CREATE MATERIALIZED VIEW mv_word_definition_translation AS
SELECT
  wd.word_id,
  def.id           AS definition_id,
  de.translation_id
FROM word_details wd
JOIN definition def
  ON wd.id = def.word_details_id
JOIN definition_example de
  ON def.id = de.definition_id
WITH NO DATA;  -- populate later with REFRESH MATERIALIZED VIEW


