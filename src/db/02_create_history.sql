-- 1) History tables -------------------------------------------------------

CREATE TABLE history_source (
  LIKE source INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE history_word (
  LIKE word INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE history_spelling_variant (
  LIKE spelling_variant INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE history_word_details (
  LIKE word_details INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE history_definition (
  LIKE definition INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE history_word_details_example (
  LIKE word_details_example INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE history_definition_example (
  LIKE definition_example INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE history_translations (
  LIKE translations INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);


-- 2) Trigger functions ----------------------------------------------------

CREATE OR REPLACE FUNCTION history_source_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  full_row history_source;
BEGIN
  SELECT
    OLD.id, OLD.name, OLD.authors, OLD.publication_year, OLD.provided_by, OLD.provided_by_url, OLD.processed_by,
    OLD.copyright, OLD.see_source_url, OLD.description,
    OLD.created_by, OLD.updated_by, OLD.created_at, OLD.updated_at,
    OLD.updated_at, CURRENT_TIMESTAMP -- valid_from, valid_to
  INTO full_row;

  BEGIN
    INSERT INTO history_source OVERRIDING SYSTEM VALUE VALUES (full_row.*);
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



CREATE OR REPLACE FUNCTION history_word_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  full_row history_word;
BEGIN
  SELECT
    OLD.id, OLD.spelling, OLD.lang_dialect_id, OLD.created_by, OLD.updated_by,
    OLD.created_at, OLD.updated_at,
    OLD.updated_at, CURRENT_TIMESTAMP, -- valid_from, valid_to
	OLD.source_id
  INTO full_row;

  BEGIN
    INSERT INTO history_word OVERRIDING SYSTEM VALUE VALUES (full_row.*);
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


CREATE OR REPLACE FUNCTION history_spelling_variant_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  full_row history_spelling_variant;
BEGIN
  SELECT
    OLD.id, OLD.lang_dialect_id, OLD.word_id, OLD.spelling,
    OLD.created_at, OLD.updated_at,
    OLD.updated_at, CURRENT_TIMESTAMP, -- valid_from, valid_to
	OLD.source_id
  INTO full_row;

  BEGIN
    INSERT INTO history_spelling_variant OVERRIDING SYSTEM VALUE VALUES (full_row.*);
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



CREATE OR REPLACE FUNCTION history_word_details_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  full_row history_word_details;
BEGIN
  SELECT
    OLD.id, OLD.word_id, OLD.order_idx, OLD.inflection, OLD.lang_dialect_id, OLD.source_id,
    OLD.created_by, OLD.updated_by, OLD.created_at, OLD.updated_at,
    OLD.updated_at, CURRENT_TIMESTAMP -- valid_from, valid_to
  INTO full_row;
  
  BEGIN
    INSERT INTO history_word_details OVERRIDING SYSTEM VALUE VALUES (full_row.*);
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



CREATE OR REPLACE FUNCTION history_definition_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  full_row history_definition;
BEGIN
  SELECT
    OLD.id, OLD.word_details_id, OLD.values, OLD.tags,
    OLD.created_by, OLD.updated_by, OLD.created_at, OLD.updated_at,
    OLD.updated_at, CURRENT_TIMESTAMP -- valid_from, valid_to
  INTO full_row;
  
  BEGIN
    INSERT INTO history_definition OVERRIDING SYSTEM VALUE VALUES (full_row.*);
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



CREATE OR REPLACE FUNCTION history_translations_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  full_row history_translations;
BEGIN
  SELECT
    OLD.id, OLD.phrases_per_lang_dialect, OLD.tags, OLD.raw,
    OLD.created_by, OLD.updated_by, OLD.created_at, OLD.updated_at,
    OLD.updated_at, CURRENT_TIMESTAMP -- valid_from, valid_to
  INTO full_row;
  
  BEGIN
    INSERT INTO history_translations OVERRIDING SYSTEM VALUE VALUES (full_row.*);
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

CREATE OR REPLACE FUNCTION history_word_details_example_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  full_row history_word_details_example;
BEGIN
  SELECT
    OLD.word_details_id, OLD.translation_id,
    OLD.created_by, OLD.created_at,
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
    OLD.created_by, OLD.created_at,
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


-- 3) Attach triggers -------------------------------------------------------

CREATE TRIGGER history_source_trig
  BEFORE UPDATE OR DELETE ON source
  FOR EACH ROW EXECUTE FUNCTION history_source_trigger();

CREATE TRIGGER history_word_trig
  BEFORE UPDATE OR DELETE ON word
  FOR EACH ROW EXECUTE FUNCTION history_word_trigger();

CREATE TRIGGER history_spelling_variant_trig
  BEFORE UPDATE OR DELETE ON spelling_variant
  FOR EACH ROW EXECUTE FUNCTION history_spelling_variant_trigger();

CREATE TRIGGER history_word_details_trig
  BEFORE UPDATE OR DELETE ON word_details
  FOR EACH ROW EXECUTE FUNCTION history_word_details_trigger();

CREATE TRIGGER history_definition_trig
  BEFORE UPDATE OR DELETE ON definition
  FOR EACH ROW EXECUTE FUNCTION history_definition_trigger();

CREATE TRIGGER history_word_details_example_trig
  BEFORE UPDATE OR DELETE ON word_details_example
  FOR EACH ROW EXECUTE FUNCTION history_word_details_example_trigger();

CREATE TRIGGER history_definition_example_trig
  BEFORE UPDATE OR DELETE ON definition_example
  FOR EACH ROW EXECUTE FUNCTION history_definition_example_trigger();

CREATE TRIGGER history_translations_trig
  BEFORE UPDATE OR DELETE ON translations
  FOR EACH ROW EXECUTE FUNCTION history_translations_trigger();
