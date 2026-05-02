import 'server-only';

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getDataSource } from '@repository/dataSource';
import { Role } from '@repository/entities/enums';
import { hashPassword, isBcryptPasswordHash, verifyPassword } from '@repository/password';

const SESSION_COOKIE = 'gafargan_dashboard_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type DashboardSessionUser = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  passwordChangedAt: string;
};

type SessionPayload = DashboardSessionUser & {
  exp: number;
};

const getAuthSecret = () => {
  const secret = process.env.DASHBOARD_AUTH_SECRET;
  if (!secret) {
    throw new Error('DASHBOARD_AUTH_SECRET environment variable is not set');
  }
  return secret;
};

const encodeBase64Url = (value: string) => Buffer.from(value).toString('base64url');

const decodeBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (value: string) =>
  crypto.createHmac('sha256', getAuthSecret()).update(value).digest('base64url');

const timingSafeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const createSessionValue = (user: DashboardSessionUser) => {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
};

const parseSessionValue = (sessionValue?: string): DashboardSessionUser | null => {
  if (!sessionValue) {
    return null;
  }

  const [encodedPayload, signature] = sessionValue.split('.');

  if (!encodedPayload || !signature || !timingSafeEqual(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;
    if (
      !payload.id ||
      !payload.email ||
      !payload.role ||
      !payload.passwordChangedAt ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      passwordChangedAt: payload.passwordChangedAt,
    };
  } catch {
    return null;
  }
};

export const canAccessDashboard = (role: Role) => role === Role.Admin || role === Role.Moderator;
export const canManageDashboardUsers = (role: Role) => role === Role.Admin;

type LoginUserRow = {
  id: number;
  name: string | null;
  email: string;
  password: string;
  role: Role;
  password_changed_at: Date;
};

type SessionUserRow = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  password_changed_at: Date;
};

export async function authenticateDashboardUser(email: string, password: string) {
  const dataSource = await getDataSource();
  const [user] = await dataSource.query<LoginUserRow[]>(
    `
      SELECT id, name, email, password, role, password_changed_at
      FROM "user"
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email.trim()],
  );

  if (!user || !(await verifyPassword(password, user.password)) || !canAccessDashboard(user.role)) {
    return null;
  }

  if (!isBcryptPasswordHash(user.password)) {
    await dataSource.query('UPDATE "user" SET password = $1 WHERE id = $2', [
      await hashPassword(password),
      user.id,
    ]);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    passwordChangedAt: user.password_changed_at.toISOString(),
  };
}

export async function createDashboardSession(user: DashboardSessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
}

export async function clearDashboardSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getDashboardSessionUser(): Promise<DashboardSessionUser | null> {
  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session || !canAccessDashboard(session.role)) {
    return null;
  }

  const dataSource = await getDataSource();
  const [user] = await dataSource.query<SessionUserRow[]>(
    `
      SELECT id, name, email, role, password_changed_at
      FROM "user"
      WHERE id = $1
      LIMIT 1
    `,
    [session.id],
  );

  if (!user || !canAccessDashboard(user.role)) {
    return null;
  }

  const currentPasswordChangedAt = user.password_changed_at.toISOString();

  if (session.passwordChangedAt !== currentPasswordChangedAt) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    passwordChangedAt: currentPasswordChangedAt,
  };
}

export async function requireDashboardUser(
  lang: string,
  redirectTo?: string,
): Promise<DashboardSessionUser> {
  const user = await getDashboardSessionUser();

  if (!user) {
    const params = new URLSearchParams();
    if (redirectTo) {
      params.set('redirectTo', redirectTo);
    }
    redirect(`/${lang}/dashboard/login${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return user;
}

export async function requireDashboardAdminUser(
  lang: string,
  redirectTo?: string,
): Promise<DashboardSessionUser> {
  const user = await requireDashboardUser(lang, redirectTo);

  if (!canManageDashboardUsers(user.role)) {
    redirect(`/${lang}/dashboard`);
  }

  return user;
}

export async function requireDashboardApiUser(): Promise<
  | { user: DashboardSessionUser; response: null }
  | { user: null; response: NextResponse<{ message: string }> }
> {
  const user = await getDashboardSessionUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { user, response: null };
}

export async function requireDashboardAdminApiUser(): Promise<
  | { user: DashboardSessionUser; response: null }
  | { user: null; response: NextResponse<{ message: string }> }
> {
  const { user, response } = await requireDashboardApiUser();

  if (response) {
    return { user: null, response };
  }

  if (!canManageDashboardUsers(user.role)) {
    return {
      user: null,
      response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }),
    };
  }

  return { user, response: null };
}
