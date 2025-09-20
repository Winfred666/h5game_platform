import React from "react";
import Link from "next/link";
import { Mail, Home, Tv } from "lucide-react";

const Footer: React.FC = () => {
  return (
    // Replaces Paper with a standard footer element, styled with a top border.
    <footer className="border-t bg-sidebar py-6">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4">
        {/* Replaces Box with a standard div using flexbox for the icon links */}
        <div className="flex justify-center gap-6">
          <Link
            href="https://www.qsc.zju.edu.cn"
            target="_blank" // Good practice for external links
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-red-500"
            aria-label="Homepage"
          >
            <Home className="h-5 w-5" />
          </Link>
          <Link
            href="mailto:tech@zjuqsc.com"
            className="text-muted-foreground transition-colors hover:text-pink-500"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </Link>
          <Link
            href="https://space.bilibili.com/104427247"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-cyan-500"
            aria-label="Bilibili"
          >
            {/* Lucide doesn't have a Bilibili icon, Tv2 is a good generic replacement */}
            <Tv className="h-5 w-5" />
          </Link>
          <Link
            href="https://github.com/Winfred666/h5game_platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-purple-500"
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </Link>
        </div>

        {/* Replaces Typography with a simple <p> tag */}
        <p className="text-center text-sm text-muted-foreground">
          Copyright © 2025-{new Date().getFullYear()}
          <Link href="http://beian.miit.gov.cn/" className="inline px-1">
            粤ICP备2025472855号-1
          </Link>
           （部分图标为友情链接）
        </p>
      </div>
    </footer>
  );
};

export default Footer;
