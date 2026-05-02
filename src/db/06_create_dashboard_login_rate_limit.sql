CREATE TABLE IF NOT EXISTS dashboard_login_rate_limit (
  email            TEXT      NOT NULL,
  ip_address       TEXT      NOT NULL,
  attempt_count    INTEGER   NOT NULL DEFAULT 0,
  first_attempt_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_attempt_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  locked_until     TIMESTAMP NULL,
  PRIMARY KEY (email, ip_address)
);

CREATE INDEX IF NOT EXISTS dashboard_login_rate_limit_locked_until_idx
  ON dashboard_login_rate_limit (locked_until);
