import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ message: 'If the email exists, a reset link will be sent' });

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await prisma.passwordResetToken.create({ data: { token, userId: user.id, expires } });

  await sendPasswordResetEmail({ userName: user.name || 'Customer', userEmail: email, token });

  return NextResponse.json({ message: 'If the email exists, a reset link will be sent' });
} 