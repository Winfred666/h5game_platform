"use client";

import { ALL_NAVPATH } from "@/lib/clientConfig";
import { Link } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [ALL_NAVPATH.admin_review, ALL_NAVPATH.admin_games, ALL_NAVPATH.admin_users, ALL_NAVPATH.admin_tags];

export default function AdminTabs() {
  const pathName = usePathname();
  const current_path_idx = navLinks.findIndex((nav) =>
    pathName.includes(nav.href)
  );
  return (
    <nav className=" p-2 mb-2 flex items-center gap-6">
      {navLinks.map((link, index) => (
        <Link
          key={link.name}
          href={link.href}
          className={
            "navbar-button cursor-pointer " +
            (current_path_idx === index ? "navbar-active-button" : "")
          }
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
