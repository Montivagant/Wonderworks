import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    
    // Validate input
    if (!email || !password) {
      console.error('Registration failed: Email and password required');
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error(`Registration failed: Invalid email format - ${email}`);
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check for existing user
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      console.error(`Registration failed: Email already in use - ${email}`);
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Password strength validation
    if (password.length < 8) {
      console.error('Registration failed: Password too short');
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({ 
      data: { 
        email, 
        password: hashed, 
        name,
        isVerified: false,  // Explicitly set to false
        role: 'CUSTOMER'  // Default role
      } 
    });

    // Generate email verification token (24h expiry)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.verificationToken.create({ 
      data: { 
        token, 
        userId: user.id, 
        expires 
      } 
    });

    // Send verification email (with fallback)
    try {
      // Check if email configuration is complete
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        await sendVerificationEmail({ 
          userName: name || 'Customer', 
          userEmail: email, 
          token 
        });
      } else {
        console.warn('Email configuration incomplete. Skipping verification email.');
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Do not delete user if email fails to send
    }

    return NextResponse.json({ 
      message: 'Registration successful. ' + 
               (process.env.SMTP_HOST ? 'Please verify your email.' : 'Login to continue.'),
      userId: user.id
    });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
} 