"use client";

import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Check if we're on the home page
  const isHomePage = pathname === "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const newTheme = resolvedTheme === "dark" ? "light" : "dark";

      // On home page or if View Transitions API is not supported, change theme directly
      if (isHomePage || !document.startViewTransition) {
        setTheme(newTheme);
        return;
      }

      // Get click coordinates for the circle origin
      const x = event.clientX;
      const y = event.clientY;

      // Calculate the maximum radius needed to cover the entire screen
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      setIsAnimating(true);

      // Start the view transition
      const transition = document.startViewTransition(() => {
        setTheme(newTheme);
      });

      transition.ready.then(() => {
        // Animate the clip-path from the click point
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: resolvedTheme === "dark" ? clipPath : clipPath.reverse(),
          },
          {
            duration: 500,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement:
              resolvedTheme === "dark"
                ? "::view-transition-new(root)"
                : "::view-transition-old(root)",
          }
        );
      });

      transition.finished.then(() => {
        setIsAnimating(false);
      });
    },
    [resolvedTheme, setTheme, isHomePage]
  );

  if (!mounted) {
    return (
      <button
        className="relative h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
        aria-label="Toggle theme"
      >
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <>
      {/* Global styles for view transitions */}
      <style jsx global>{`
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }

        ::view-transition-old(root) {
          z-index: 1;
        }

        ::view-transition-new(root) {
          z-index: 9999;
        }

        .dark::view-transition-old(root) {
          z-index: 9999;
        }

        .dark::view-transition-new(root) {
          z-index: 1;
        }
      `}</style>

      <button
        ref={buttonRef}
        onClick={toggleTheme}
        disabled={isAnimating}
        className={`
          relative h-8 w-8 rounded-full
          flex items-center justify-center
          transition-all duration-300 ease-out
          border-2
          ${isDark
            ? "bg-zinc-900 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800"
            : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
          }
          ${isAnimating ? "scale-95" : "hover:scale-105 active:scale-95"}
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${isDark ? "focus-visible:ring-zinc-400" : "focus-visible:ring-zinc-400"}
          disabled:cursor-wait
        `}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {/* Sun icon */}
        <Sun
          className={`
            absolute h-4 w-4 transition-all duration-300
            ${isDark
              ? "rotate-90 scale-0 opacity-0 text-amber-400"
              : "rotate-0 scale-100 opacity-100 text-zinc-600"
            }
          `}
        />

        {/* Moon icon */}
        <Moon
          className={`
            absolute h-4 w-4 transition-all duration-300
            ${isDark
              ? "rotate-0 scale-100 opacity-100 text-zinc-300"
              : "-rotate-90 scale-0 opacity-0 text-zinc-600"
            }
          `}
        />

        {/* Subtle glow effect */}
        <span
          className={`
            absolute inset-0 rounded-full transition-opacity duration-300
            ${isDark ? "opacity-0" : "opacity-30"}
            bg-gradient-to-tr from-zinc-200 to-zinc-100
            blur-md -z-10
          `}
        />

        <span className="sr-only">Toggle theme</span>
      </button>
    </>
  );
}
