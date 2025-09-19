import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
      updatedAt: string; // just getTime().toString, not ISO type to prevent URL issues
      id: string; // Changed to string to match NextAuth requirements
      name: string; // Explicitly declare name
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    isAdmin: boolean;
    updatedAt: string;
    id: string; // Changed to string
    name: string; // Explicitly declare name
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    isAdmin: boolean;
    updatedAt: string;
    id: string; // Changed to string
    name: string; // Explicitly declare name
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    /** A unique identifier for the user. */
    id: string;
    /** The user's email address. */
    email: string;
    /** The user's name. */
    name: string;
    /** Whether the user has verified their email address. */
    emailVerified: Date | null;
    /** Custom field: whether the user is an admin. */
    isAdmin: boolean;
    updatedAt: string;
  }
}
