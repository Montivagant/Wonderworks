import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Extend NextAuth types for custom user properties
interface CustomUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
          const { email, password } = credentials ?? {};
          if (!email || !password) {
            console.error('Missing email or password');
            throw new Error('Missing email or password');
          }
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            console.error(`No user found with email: ${email}`);
            throw new Error('No user found with this email');
          }
          if (!user.password) {
            console.error(`User ${email} has no password set`);
            throw new Error('No password set for this user');
          }
          if (!user.isVerified) {
            console.error(`User ${email} is not verified`);
            throw new Error('Email not verified');
          }
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) {
            console.error(`Invalid password for user: ${email}`);
            throw new Error('Invalid password');
          }
          return { 
            id: user.id.toString(), 
            email: user.email, 
            name: user.name, 
            role: user.role 
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as CustomUser).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 