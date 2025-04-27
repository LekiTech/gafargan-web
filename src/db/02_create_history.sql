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
BEGIN
  INSERT INTO history_source
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION history_word_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO history_word
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION history_spelling_variant_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO history_spelling_variant
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION history_word_details_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO history_word_details
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION history_definition_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO history_definition
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION history_word_details_example_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO history_word_details_example
    SELECT OLD.*, OLD.created_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION history_definition_example_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO history_definition_example
    SELECT OLD.*, OLD.created_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION history_translations_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO history_translations
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
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
