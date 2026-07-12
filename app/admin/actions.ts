'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSession } from '@/lib/session';

export async function login(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    await createSession();
    return { success: true };
  }

  return { success: false, error: 'Contraseña incorrecta' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/admin');
}
