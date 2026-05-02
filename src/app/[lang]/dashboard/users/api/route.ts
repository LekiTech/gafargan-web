import { NextRequest, NextResponse } from 'next/server';
import { requireDashboardAdminApiUser } from '@/dashboard/auth';
import {
  createDashboardUser,
  DashboardUserInput,
  getDashboardUsers,
  updateDashboardUser,
} from '@repository/user.repository';
import { Language, Role } from '@repository/entities/enums';

const roles = new Set(Object.values(Role));
const languages = new Set(Object.values(Language));

const isRole = (value: unknown): value is Role => typeof value === 'string' && roles.has(value as Role);

const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && languages.has(value as Language);

const cleanOptionalString = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const parseBody = (body: any, requirePassword: boolean): DashboardUserInput | { message: string } => {
  const email = cleanOptionalString(body?.email);
  const name = cleanOptionalString(body?.name);
  const password = typeof body?.password === 'string' ? body.password : '';
  const language = body?.language === null || body?.language === '' ? null : body?.language;

  if (!email) {
    return { message: 'users.errors.emailRequired' };
  }

  if (!isRole(body?.role)) {
    return { message: 'users.errors.roleRequired' };
  }

  if (language !== null && !isLanguage(language)) {
    return { message: 'users.errors.languageInvalid' };
  }

  if (requirePassword && password.trim().length === 0) {
    return { message: 'users.errors.passwordRequired' };
  }

  return {
    name,
    email,
    password: password.trim().length > 0 ? password : undefined,
    role: body.role,
    language,
    verified: Boolean(body?.verified),
  };
};

const conflictMessage = (error: unknown) => {
  if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
    return 'users.errors.emailExists';
  }

  return 'users.errors.saveFailed';
};

export async function GET() {
  const { user, response } = await requireDashboardAdminApiUser();
  if (response) {
    return response;
  }

  const users = await getDashboardUsers();

  return NextResponse.json({ users, currentUserId: user.id });
}

export async function POST(request: NextRequest) {
  const { response } = await requireDashboardAdminApiUser();
  if (response) {
    return response;
  }

  const body = await request.json();
  const input = parseBody(body, true);

  if ('message' in input) {
    return NextResponse.json({ message: input.message }, { status: 400 });
  }

  try {
    const user = await createDashboardUser(input);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: conflictMessage(error) }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const { response } = await requireDashboardAdminApiUser();
  if (response) {
    return response;
  }

  const body = await request.json();
  const id = Number(body?.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'users.errors.userIdRequired' }, { status: 400 });
  }

  const input = parseBody(body, false);

  if ('message' in input) {
    return NextResponse.json({ message: input.message }, { status: 400 });
  }

  try {
    const user = await updateDashboardUser({ ...input, id });

    if (!user) {
      return NextResponse.json({ message: 'users.errors.notFound' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ message: conflictMessage(error) }, { status: 400 });
  }
}
