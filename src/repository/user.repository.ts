import 'server-only';

import { getDataSource } from './dataSource';
import { Language, Role } from './entities/enums';
import { hashPassword } from './password';

export type DashboardUserModel = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  language: Language | null;
  verified: boolean | null;
  createdAt: string;
  updatedAt: string;
  passwordChangedAt: string;
};

export type DashboardUserInput = {
  id?: number;
  name?: string | null;
  email: string;
  password?: string;
  role: Role;
  language?: Language | null;
  verified?: boolean | null;
};

type DashboardUserRow = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  language: Language | null;
  verified: boolean | null;
  created_at: Date;
  updated_at: Date;
  password_changed_at: Date;
};

const mapUser = (user: DashboardUserRow): DashboardUserModel => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  language: user.language,
  verified: user.verified,
  createdAt: user.created_at.toISOString(),
  updatedAt: user.updated_at.toISOString(),
  passwordChangedAt: user.password_changed_at.toISOString(),
});

export async function getDashboardUsers() {
  const dataSource = await getDataSource();
  const users = await dataSource.query<DashboardUserRow[]>(
    `
      SELECT id, name, email, role, language, verified, created_at, updated_at, password_changed_at
      FROM "user"
      ORDER BY id ASC
    `,
  );

  return users.map(mapUser);
}

export async function createDashboardUser(input: DashboardUserInput) {
  const dataSource = await getDataSource();
  const passwordHash = await hashPassword(input.password ?? '');
  const [user] = await dataSource.query<DashboardUserRow[]>(
    `
      INSERT INTO "user" (name, email, password, language, verified, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role, language, verified, created_at, updated_at, password_changed_at
    `,
    [
      input.name?.trim() || null,
      input.email.trim(),
      passwordHash,
      input.language ?? null,
      input.verified ?? false,
      input.role,
    ],
  );

  return mapUser(user);
}

export async function updateDashboardUser(input: DashboardUserInput & { id: number }) {
  const dataSource = await getDataSource();
  const values = [
    input.name?.trim() || null,
    input.email.trim(),
    input.language ?? null,
    input.verified ?? false,
    input.role,
    input.id,
  ];
  const passwordSql =
    typeof input.password === 'string' && input.password.length > 0
      ? ', password = $7, password_changed_at = CURRENT_TIMESTAMP'
      : '';
  const passwordHash =
    typeof input.password === 'string' && input.password.length > 0
      ? await hashPassword(input.password)
      : null;
  const passwordValues =
    typeof passwordHash === 'string' ? [...values, passwordHash] : values;

  const [user] = await dataSource.query<DashboardUserRow[]>(
    `
      UPDATE "user"
      SET name = $1,
          email = $2,
          language = $3,
          verified = $4,
          role = $5
          ${passwordSql}
      WHERE id = $6
      RETURNING id, name, email, role, language, verified, created_at, updated_at, password_changed_at
    `,
    passwordValues,
  );

  return user ? mapUser(user) : null;
}
