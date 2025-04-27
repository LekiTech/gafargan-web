-- 1) History tables -------------------------------------------------------

CREATE TABLE source_history (
  LIKE source INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE expression_history (
  LIKE expression INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE expression_match_details_history (
  LIKE expression_match_details INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE expression_details_history (
  LIKE expression_details INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);

CREATE TABLE definitions_history (
  LIKE definitions INCLUDING ALL,
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL
);


-- 2) Trigger functions ----------------------------------------------------

-- source
CREATE OR REPLACE FUNCTION source_history_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- stamp old row with its last updated_at and now() as end of validity
  INSERT INTO source_history
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- expression
CREATE OR REPLACE FUNCTION expression_history_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO expression_history
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- expression_match_details
CREATE OR REPLACE FUNCTION expression_match_details_history_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO expression_match_details_history
    SELECT OLD.*, OLD.created_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- expression_details
CREATE OR REPLACE FUNCTION expression_details_history_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO expression_details_history
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- definitions
CREATE OR REPLACE FUNCTION definitions_history_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO definitions_history
    SELECT OLD.*, OLD.updated_at, CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


-- 3) Attach triggers -------------------------------------------------------

-- source
CREATE TRIGGER source_history_trig
  BEFORE UPDATE OR DELETE ON source
  FOR EACH ROW EXECUTE FUNCTION source_history_trigger();

-- expression
CREATE TRIGGER expression_history_trig
  BEFORE UPDATE OR DELETE ON expression
  FOR EACH ROW EXECUTE FUNCTION expression_history_trigger();

-- expression_match_details
CREATE TRIGGER expression_match_details_history_trig
  BEFORE UPDATE OR DELETE ON expression_match_details
  FOR EACH ROW EXECUTE FUNCTION expression_match_details_history_trigger();

-- expression_details
CREATE TRIGGER expression_details_history_trig
  BEFORE UPDATE OR DELETE ON expression_details
  FOR EACH ROW EXECUTE FUNCTION expression_details_history_trigger();

-- definitions
CREATE TRIGGER definitions_history_trig
  BEFORE UPDATE OR DELETE ON definitions
  FOR EACH ROW EXECUTE FUNCTION definitions_history_trigger();
