'use server';

import { cookies } from 'next/headers';
import { getStrapiBaseUrl } from '@/lib/strapi';

export type UserSession = {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    documentId?: string;
  };
};

const COOKIE_NAME = 'shuru_session';

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  try {
    const jsonStr = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    return JSON.parse(jsonStr) as UserSession;
  } catch (err) {
    console.error("Error parsing session cookie:", err);
    return null;
  }
}

export async function getMe() {
  const session = await getSession();
  if (!session) return null;

  try {
    const res = await fetch(`${getStrapiBaseUrl()}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${session.jwt}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const freshUser = await res.json();
      return {
        jwt: session.jwt,
        user: {
          id: freshUser.id,
          username: freshUser.username,
          email: freshUser.email,
          documentId: freshUser.documentId,
        },
      };
    }
  } catch (err) {
    console.error("Error fetching users/me from Strapi:", err);
  }

  return session;
}

export async function loginAction(data: any) {
  try {
    const res = await fetch(`${getStrapiBaseUrl()}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: data.identifier,
        password: data.password,
      }),
      cache: 'no-store',
    });

    const result = await res.json();

    if (!res.ok) {
      return { success: false, error: result.error?.message || 'Invalid credentials' };
    }

    const session: UserSession = {
      jwt: result.jwt,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        documentId: result.user.documentId,
      },
    };

    const cookieStore = await cookies();
    const encodedSession = Buffer.from(JSON.stringify(session)).toString('base64');

    cookieStore.set(COOKIE_NAME, encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred' };
  }
}

export async function registerAction(data: any) {
  try {
    const res = await fetch(`${getStrapiBaseUrl()}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
      cache: 'no-store',
    });

    const result = await res.json();

    if (!res.ok) {
      return { success: false, error: result.error?.message || 'Registration failed' };
    }

    const session: UserSession = {
      jwt: result.jwt,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        documentId: result.user.documentId,
      },
    };

    const cookieStore = await cookies();
    const encodedSession = Buffer.from(JSON.stringify(session)).toString('base64');

    cookieStore.set(COOKIE_NAME, encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred' };
  }
}

export async function setOAuthSessionAction(jwt: string) {
  try {
    const res = await fetch(`${getStrapiBaseUrl()}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { success: false, error: 'Failed to fetch user profile from Strapi' };
    }

    const user = await res.json();

    const session: UserSession = {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        documentId: user.documentId,
      },
    };

    const cookieStore = await cookies();
    const encodedSession = Buffer.from(JSON.stringify(session)).toString('base64');

    cookieStore.set(COOKIE_NAME, encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save session' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function updateProfileAction(data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch(`${getStrapiBaseUrl()}/api/users/${session.user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.jwt}`,
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
      }),
      cache: 'no-store',
    });

    const result = await res.json();

    if (!res.ok) {
      return { success: false, error: result.error?.message || 'Profile update failed' };
    }

    const updatedSession: UserSession = {
      jwt: session.jwt,
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        documentId: result.documentId || session.user.documentId,
      },
    };

    const cookieStore = await cookies();
    const encodedSession = Buffer.from(JSON.stringify(updatedSession)).toString('base64');

    cookieStore.set(COOKIE_NAME, encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, user: updatedSession.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred' };
  }
}

export async function changePasswordAction(data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch(`${getStrapiBaseUrl()}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.jwt}`,
      },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      }),
      cache: 'no-store',
    });

    const result = await res.json();

    if (!res.ok) {
      return { success: false, error: result.error?.message || 'Password update failed' };
    }

    const updatedSession: UserSession = {
      jwt: result.jwt,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        documentId: result.user.documentId || session.user.documentId,
      },
    };

    const cookieStore = await cookies();
    const encodedSession = Buffer.from(JSON.stringify(updatedSession)).toString('base64');

    cookieStore.set(COOKIE_NAME, encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred' };
  }
}

export async function exchangeOAuthTokenAction(provider: string, accessToken: string) {
  try {
    const res = await fetch(`${getStrapiBaseUrl()}/api/auth/${provider}/callback?access_token=${accessToken}`, {
      cache: 'no-store',
    });

    const result = await res.json();

    if (!res.ok) {
      return { success: false, error: result.error?.message || 'OAuth exchange failed' };
    }

    const session: UserSession = {
      jwt: result.jwt,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        documentId: result.user.documentId,
      },
    };

    const cookieStore = await cookies();
    const encodedSession = Buffer.from(JSON.stringify(session)).toString('base64');

    cookieStore.set(COOKIE_NAME, encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to complete OAuth exchange' };
  }
}
