"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LuMenu } from "react-icons/lu";

interface DashboardNavProps {
  onMenuClick?: () => void;
}

export function DashboardNav({ onMenuClick }: DashboardNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  return (
    <nav className="flex items-center space-x-4">
      <Button
        variant="ghost"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <LuMenu className="h-5 w-5" />
      </Button>
        <div className="hidden sm:flex items-center space-x-4">
        <ThemeToggle />
        </div>
    </nav>
  );
}



