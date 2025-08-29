import "server-only";
import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "../dbInit";
import { LoginFormInputSchema } from "../types/zforms";
import bcrypt from "bcryptjs";
import { ALL_NAVPATH } from "../clientConfig";

// provide authentication services of SQL to user.
// WARNING: more mordern auth services like OAuth2, OpenID Connect, MAGIC LINK, etc. are recommended.
const isProduction = process.env.NODE_ENV === "production";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: process.env.NEXT_PUBLIC_BASEPATH + ALL_NAVPATH.login.href(), // custom login page
    error: process.env.NEXT_PUBLIC_BASEPATH + "/error", // error page, redirect to login page
    signOut: process.env.NEXT_PUBLIC_BASEPATH + ALL_NAVPATH.auto_signout.href, // custom logout page
  },
  
  cookies: {
    sessionToken: {
      // Use the secure prefix in production, but a simple name in development
      name: isProduction
        ? `__Secure-h5games.session-token`
        : `h5games.session-token`,
    },
    callbackUrl: {
      name: isProduction
        ? `__Secure-h5games.callback-url`
        : `h5games.callback-url`,
    },
    csrfToken: {
      // Use the __Host- prefix in production for maximum security
      name: isProduction ? `__Host-h5games.csrf-token` : `h5games.csrf-token`,
    },
  },

  providers: [
    Credentials({
      authorize: async (credentials): Promise<User> => {
        const { qq, password } = await LoginFormInputSchema.parseAsync(
          credentials
        );
        const user = await db.user.findUnique({
          where: {
            qq: qq,
          },
          select: {
            id: true,
            name: true,
            isAdmin: true,
            hash: true,
          }, // only use these as JWT payload
        });
        console.log("User found:", user);
        if (!user) {
          throw new Error("无效的QQ号"); // error will handle it
        }
        const isPasswordValid = await bcrypt.compare(password, user.hash);
        if (!isPasswordValid) {
          throw new Error("密码错误");
        }
        return {
          id: user.id,
          isAdmin: user.isAdmin,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    // called whenever a JSON Web Token is created
    async jwt({ token, user, trigger }) {
      // The 'user' object is available only on the first call after sign-in.
      // In subsequent calls (when a session is accessed), only 'token' is available.
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.name = user.name; // ensure name is always set
      }
      if (trigger === "update" && token.id) {
        // receive from db
        const curUser = await db.user.findUnique({
          where: {id: token.id},
          select: {
            id: true,
            isAdmin: true,
            name: true, // only return these fields
          },
        });
        if(curUser){
          token.id = curUser.id;
          token.isAdmin = curUser.isAdmin;
          token.name = curUser.name; // update name if changed
        }
      }
      return token;
    },

    // called whenever a session is accessed,
    // By default, only a subset of the token is returned for increased security
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.name = token.name; // no other access token
      }
      return session;
    },
  },
  logger: {
    error: (error: any) => {
      if (error.type !== "CallbackRouteError")
        console.error("Debug Auth Error:", error);
    },
  },
});
