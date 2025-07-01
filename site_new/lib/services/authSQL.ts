"server-only"
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials"
import { SALT_ROUNDS } from "../serverConfig";
import { db } from "../dbInit";
import { IUserJWT } from "../types/iuser";
import { LoginFormInputSchema } from "../types/zforms";

// provide authentication services of SQL to user.
// WARNING: more mordern auth services like OAuth2, OpenID Connect, MAGIC LINK, etc. are recommended.

export const {handlers, signIn, signOut, auth} = NextAuth({
  pages: {
    signIn: process.env.NEXT_PUBLIC_BASEPATH + "/login", // custom login page
  },
  providers:[
    Credentials({
      authorize: async (credentials):Promise<IUserJWT> => {
        const {qq,password} = await LoginFormInputSchema.parseAsync(credentials);
        const hashedPassword = await bcrypt.hash(password as string, SALT_ROUNDS);
        const user = await db.user.findUnique({
          where: {
            qq: qq,
            hash: hashedPassword,
          },
          select: {
            id: true,
            isAdmin: true,
          } // only use these as JWT payload
        });
        if (!user) {
          throw new Error("无效的QQ号或密码"); // error will handle it
        }
        return {
          id: user.id.toString(),
          isAdmin: user.isAdmin,
        };
      }
    })
  ],
  logger: {
    error:(error: any)=>{
      if(error.type !== "CallbackRouteError")
        console.error("Auth Error:", error);
    }
  }
});
