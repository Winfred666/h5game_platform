"use client";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // This will now only run on the client side
    signOut({redirect: true, redirectTo: process.env.NEXT_PUBLIC_BASEPATH + "/"});
  }, []);

  return null;
}
