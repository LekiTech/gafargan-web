import 'server-only';

import { getDataSource } from '@repository/dataSource';

const WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 15;
const MAX_ATTEMPTS = 5;

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

type LoginRateLimitRow = {
  locked_until: Date | string | null;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toResult = (lockedUntil?: Date | string | null): RateLimitResult => {
  if (lockedUntil === null || lockedUntil === undefined) {
    return { allowed: true };
  }
  const lockedUntilTime =
    lockedUntil instanceof Date ? lockedUntil.getTime() : new Date(lockedUntil).getTime();
  const retryAfterSeconds = Math.ceil((lockedUntilTime - Date.now()) / 1000);
  if (retryAfterSeconds <= 0) {
    return { allowed: true };
  }

  return { allowed: false, retryAfterSeconds };
};

export async function checkLoginRateLimit(email: string, ip: string): Promise<RateLimitResult> {
  const dataSource = await getDataSource();
  const [attempt] = await dataSource.query<LoginRateLimitRow[]>(
    `
      SELECT locked_until
      FROM dashboard_login_rate_limit
      WHERE email = $1
        AND ip_address = $2
        AND locked_until > now()
      LIMIT 1
    `,
    [normalizeEmail(email), ip],
  );
  return toResult(attempt?.locked_until);
}

export async function recordFailedLogin(email: string, ip: string): Promise<RateLimitResult> {
  const dataSource = await getDataSource();
  const [attempt] = await dataSource.query<LoginRateLimitRow[]>(
    `
      INSERT INTO dashboard_login_rate_limit (
        email,
        ip_address,
        attempt_count,
        first_attempt_at,
        last_attempt_at,
        locked_until
      )
      VALUES ($1, $2, 1, now(), now(), NULL)
      ON CONFLICT (email, ip_address)
      DO UPDATE SET
        attempt_count = CASE
          WHEN dashboard_login_rate_limit.first_attempt_at < now() - ($3::text || ' minutes')::interval
            THEN 1
          ELSE dashboard_login_rate_limit.attempt_count + 1
        END,
        first_attempt_at = CASE
          WHEN dashboard_login_rate_limit.first_attempt_at < now() - ($3::text || ' minutes')::interval
            THEN now()
          ELSE dashboard_login_rate_limit.first_attempt_at
        END,
        last_attempt_at = now(),
        locked_until = CASE
          WHEN dashboard_login_rate_limit.first_attempt_at >= now() - ($3::text || ' minutes')::interval
           AND dashboard_login_rate_limit.attempt_count + 1 >= $4
            THEN now() + ($5::text || ' minutes')::interval
          ELSE NULL
        END
      RETURNING locked_until
    `,
    [normalizeEmail(email), ip, WINDOW_MINUTES, MAX_ATTEMPTS, LOCKOUT_MINUTES],
  );

  return toResult(attempt?.locked_until);
}

export async function clearFailedLogins(email: string, ip: string) {
  const dataSource = await getDataSource();
  await dataSource.query(
    `
      DELETE FROM dashboard_login_rate_limit
      WHERE email = $1
        AND ip_address = $2
    `,
    [normalizeEmail(email), ip],
  );
}

export async function cleanupExpiredLoginRateLimits() {
  const dataSource = await getDataSource();
  await dataSource.query(
    `
      DELETE FROM dashboard_login_rate_limit
      WHERE locked_until IS NULL
        AND first_attempt_at < timezone('utc', now()) - ($1::text || ' minutes')::interval
    `,
    [WINDOW_MINUTES],
  );
}
