"use client";
import {
  IconChartLine,
  IconDatabase,
  IconFileText,
  IconMapPin,
  IconMessageCircle,
  IconUsers,
} from "@tabler/icons-react";
import { FloatingDock } from "@/components/ui/floating-dock";

export function HomeNavbar({ onChatClick }: { onChatClick?: () => void }) {
  const navItems = [
    {
      title: "Ocean Data",
      href: "/not-implemented",
      icon: <IconDatabase className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    },
    {
      title: "Analysis Tools",
      href: "/not-implemented",
      icon: <IconChartLine className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    },
    {
      title: "Live Floats",
      href: "/not-implemented",
      icon: <IconMapPin className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    },
    {
      title: "AI Chat",
      href: "/chat",
      icon: <IconMessageCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: onChatClick,
    },
    {
      title: "Research",
      href: "/not-implemented",
      icon: <IconUsers className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    },
    {
      title: "Documentation",
      href: "/not-implemented",
      icon: <IconFileText className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    },
  ];

  return (
    <div className="-translate-x-1/2 fixed bottom-8 left-1/2 z-[100] font-sans">
      <FloatingDock items={navItems} />
    </div>
  );
}
