"use client";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ALL_NAVPATH } from "@/lib/clientConfig";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        // Sign out without automatic redirect
        await signOut({ redirect: false });
      } catch (error) {
        console.error("Sign out error:", error);
      } finally {
        setTimeout(() => router.push(ALL_NAVPATH.home.href()), 1000);
      }
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="w-full h-[80vh] flex items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h2 className="font-bold text-primary">正在退出登录...</h2>
    </div>
  );
}
