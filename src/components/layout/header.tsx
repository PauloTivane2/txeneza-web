"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useUIStore } from "@/features/ui/ui.store";
import { Sun, Moon, LogOut, Menu } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const userInitial = (user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="w-full bg-light-background dark:bg-dark-background/80 dark:bg-grey900/80 backdrop-blur-md border-b border-grey200 dark:border-grey800 dark:border-grey800 py-4 px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Botão de menu — apenas mobile (a sidebar está oculta nesses ecrãs) */}
        {isAuthenticated && (
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 -ml-2 rounded-xl text-grey600 dark:text-grey400 hover:bg-grey100 dark:hover:bg-grey800 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link href="/" className="text-xl font-black hover:opacity-90 transition-opacity">
          <BrandName />
        </Link>
        <span className="hidden sm:inline text-[10px] uppercase tracking-wider px-2 py-0.5 bg-forestGreen/10 dark:bg-limeGreen/10 text-forestGreen dark:text-limeGreen rounded-full font-bold">
          {isAuthenticated ? "Painel Admin" : "Web App"}
        </span>
      </div>

      <nav className="flex items-center gap-3">
        {/* Theme Switcher Button */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-grey100 dark:bg-grey900/40 dark:bg-grey950 border border-grey200 dark:border-grey800 dark:border-grey850 text-grey600 dark:text-grey400 dark:text-grey300 dark:text-grey500 hover:text-forestGreen dark:hover:text-limeGreen hover:scale-105 transition-all duration-200"
            title={theme === "light" ? "Mudar para Modo Escuro" : "Mudar para Modo Claro"}
          >
            {theme === "light" ? (
              <Moon className="w-4.5 h-4.5" />
            ) : (
              <Sun className="w-4.5 h-4.5" />
            )}
          </button>
        )}

        {/* Auth / Session State */}
        {mounted && (
          <>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Separador */}
                <span className="hidden sm:inline w-px h-6 bg-grey200 dark:bg-grey800" />

                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-forestGreen dark:bg-limeGreen text-white dark:text-forestGreen flex items-center justify-center text-sm font-black shrink-0">
                    {userInitial}
                  </div>
                  <div className="hidden sm:flex flex-col leading-tight">
                    <span className="text-xs font-bold text-grey900 dark:text-grey50 max-w-[160px] truncate">
                      {user.email || "Utilizador"}
                    </span>
                    <span className="text-[10px] text-grey600 dark:text-grey400 font-mono uppercase tracking-wide">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                  title="Terminar Sessão"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sair</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold bg-limeGreen text-forestGreen hover:bg-lightLime rounded-xl shadow-sm hover:shadow transition-all duration-200"
              >
                Entrar
              </Link>
            )}
          </>
        )}
      </nav>
    </header>
  );
};
