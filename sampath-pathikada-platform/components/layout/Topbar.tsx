"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Languages, Moon, Sun, User, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useSession } from "@/hooks/use-session";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import { toast } from "sonner";

interface TopbarProps {
  saveStatus?: "idle" | "saving" | "saved" | "error";
}

const HOME_ROUTES: Record<string, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  ADMIN: "/admin/dashboard",
  ECONOMIC_DEVELOPMENT_OFFICER: "/economic-development-officer/dashboard",
  DIVISIONAL_SECRETARIAT: "/divisional-secretariat/dashboard",
};

const PROFILE_ROUTES: Record<string, string> = {
  ECONOMIC_DEVELOPMENT_OFFICER: "/economic-development-officer/profile",
  DIVISIONAL_SECRETARIAT: "/divisional-secretariat/dashboard",
};

export function Topbar({ saveStatus = "idle" }: TopbarProps) {
  const { lang, toggle } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user } = useSession();
  const router = useRouter();

  const homeRoute = (user && HOME_ROUTES[user.role]) || "/";
  const profileRoute = (user && PROFILE_ROUTES[user.role]) || homeRoute;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/auth/login");
  }

  return (
    <header className="hidden items-center justify-between gap-4 border-b border-border bg-card/80 px-6 py-3 backdrop-blur lg:flex">
      <div className="flex min-w-0 items-center gap-3">
        <Link href={homeRoute} className="shrink-0">
          <span className="font-display text-fluid-lg font-semibold text-primary">
            <Bilingual {...dictionary.appName} />
          </span>
        </Link>
        {user?.gnDivision && (
          <span className="truncate text-fluid-sm text-muted-foreground">— {user.gnDivision}</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Save status echo */}
        <div className="mr-2 flex items-center gap-1.5 text-fluid-sm text-muted-foreground" aria-live="polite">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              <Bilingual {...dictionary.saving} />
            </>
          )}
          {saveStatus === "saved" && <Bilingual {...dictionary.saved} />}
        </div>

        {/* Language toggle */}
        <Button
          variant="outline"
          size="sm"
          className="touch-target gap-1.5"
          onClick={toggle}
          aria-label="Switch language"
        >
          <Languages className="size-4" aria-hidden="true" />
          <span className="font-medium">{lang === "si" ? "EN" : "සිං"}</span>
        </Button>

        {/* Dark mode toggle */}
        <Button
          variant="outline"
          size="icon"
          className="touch-target"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="touch-target gap-2 px-2">
              <User className="size-5" aria-hidden="true" />
              <span className="max-w-32 truncate text-fluid-sm">{user?.name ?? "…"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.role === "ECONOMIC_DEVELOPMENT_OFFICER" && (
              <DropdownMenuItem asChild>
                <Link href={profileRoute}>
                  <Bilingual {...dictionary.profile} />
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              <Bilingual {...dictionary.logout} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function useToastSaveResult() {
  const { lang } = useLanguage();
  return {
    success: () => toast.success(lang === "si" ? dictionary.saved.si : dictionary.saved.en),
    error: (message?: string) =>
      toast.error(message ?? (lang === "si" ? dictionary.saveError.si : dictionary.saveError.en)),
  };
}
