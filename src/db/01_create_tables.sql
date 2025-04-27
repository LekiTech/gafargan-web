-- 1) timestamp‐update trigger (once per database)
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Enums
CREATE TYPE Language AS ENUM ('Lezgi', 'Tabasaran', 'Russian', 'English');
CREATE TYPE Role     AS ENUM ('Admin', 'Moderator', 'User');


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
  name             VARCHAR(255) NOT NULL,
  authors          VARCHAR(255),
  publication_year VARCHAR(255),
  provided_by      VARCHAR(255),
  provided_by_url  VARCHAR(255),
  processed_by     VARCHAR(255),
  copyright        VARCHAR(255),
  see_source_url   VARCHAR(255),
  description      TEXT,
  created_by       UUID    NOT NULL REFERENCES "user"(id),
  updated_by       UUID    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER source_ts
  BEFORE UPDATE ON source
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- expression
CREATE TABLE expression (
  id               UUID    PRIMARY KEY,
  spelling         TEXT    NOT NULL,
  lang_dialect_id  INTEGER NOT NULL REFERENCES lang_dialect(id),
  created_by       UUID    NOT NULL REFERENCES "user"(id),
  updated_by       UUID    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER expression_ts
  BEFORE UPDATE ON expression
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- expression_details
CREATE TABLE expression_details (
  id               UUID    PRIMARY KEY,
  order_idx        INT,  -- order of the exp. details per expression
  inflection       TEXT,
  lang_dialect_id  INTEGER NOT NULL REFERENCES lang_dialect(id),
  source_id        UUID    REFERENCES source(id),
  examples         JSON[],
  created_by       UUID    NOT NULL REFERENCES "user"(id),
  updated_by       UUID    NOT NULL REFERENCES "user"(id),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER expression_details_ts
  BEFORE UPDATE ON expression_details
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- definitions
CREATE TABLE definitions (
  id                     UUID    PRIMARY KEY,
  expression_details_id  UUID    REFERENCES expression_details(id),
  values                 JSON[],
  examples               JSON[],
  tags                   TEXT[],
  created_by             UUID    NOT NULL REFERENCES "user"(id),
  updated_by             UUID    NOT NULL REFERENCES "user"(id),
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER definitions_ts
  BEFORE UPDATE ON definitions
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- expression_match_details
CREATE TABLE expression_match_details (
  expression_details_id  UUID    NOT NULL REFERENCES expression_details(id),
  expression_id          UUID    NOT NULL REFERENCES expression(id),
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (expression_details_id, expression_id)
);
CREATE TRIGGER expression_match_details_ts
  BEFORE UPDATE ON expression_match_details
  FOR EACH ROW EXECUTE FUNCTION set_timestamp();
