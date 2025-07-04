import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return new NextResponse('Invalid token', { status: 400 });

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return new NextResponse('Token invalid or expired', { status: 400 });
  }

  await prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } });
  await prisma.verificationToken.delete({ where: { id: record.id } });

  // Redirect to login with success message param
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL ?? ''}/login?verified=1`);
} 