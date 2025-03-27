import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase, User, IUser } from '../db/models';
import bcrypt from 'bcryptjs';

// NextAuth kullanıcı tipini genişlet
declare module "next-auth" {
  interface User {
    id: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gereklidir');
        }
        
        await connectToDatabase();
        
        // Kullanıcıyı veritabanında ara
        const user = await User.findOne({ email: credentials.email }).select('+password') as IUser & { _id: { toString(): string } };
        
        if (!user) {
          throw new Error('Kullanıcı bulunamadı');
        }
        
        // Şifre kontrolü
        const isPasswordMatch = user.password ? 
          await bcrypt.compare(credentials.password, user.password) : false;
        
        if (!isPasswordMatch) {
          throw new Error('Geçersiz şifre');
        }
        
        // Kullanıcı bilgilerini döndür (şifre hariç)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions; 