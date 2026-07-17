"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Map, MapPin, Flame, X, FileSpreadsheet } from "lucide-react";
import { useUIStore } from "@/features/ui/ui.store";
import { BrandName } from "@/components/ui/brand-name";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  accent?: boolean;
}

const MAIN_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/admin/occurrences", label: "Ocorrências", icon: <ClipboardList className="w-4 h-4" /> },
  { href: "/admin/collection-points", label: "Pontos de Recolha", icon: <MapPin className="w-4 h-4" /> },
  { href: "/admin/reports", label: "Relatórios", icon: <FileSpreadsheet className="w-4 h-4" /> },
];

const VIEW_ITEMS: NavItem[] = [
  { href: "/admin/map", label: "Mapa de Ocorrências", icon: <Map className="w-4 h-4" /> },
  { href: "/admin/heatmap", label: "Mapa de Calor", icon: <Flame className="w-4 h-4" />, badge: "Beira", accent: true },
];

const SidebarNav: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const pathname = usePathname();

  const renderLink = (item: NavItem) => {
    // Marca como ativo apenas a correspondência exata (ou sub-rota), evitando que "/admin"
    // fique sempre ativo.
    const isActive =
      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-forestGreen/10 dark:bg-limeGreen/10 text-forestGreen dark:text-limeGreen"
            : "text-grey900 dark:text-grey50 hover:bg-grey200 dark:hover:bg-grey800"
        }`}
      >
        <span className={item.accent ? "text-forestGreen dark:text-limeGreen" : ""}>{item.icon}</span>
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-auto text-[8px] tracking-wider uppercase px-1.5 py-0.5 bg-forestGreen/10 dark:bg-limeGreen/10 text-forestGreen dark:text-limeGreen rounded-md font-black border border-forestGreen/10 dark:border-limeGreen/10">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-grey600 dark:text-grey400 uppercase tracking-wider mb-2">
        Painel Principal
      </div>
      {MAIN_ITEMS.map(renderLink)}

      <div className="text-xs font-semibold text-grey600 dark:text-grey400 uppercase tracking-wider mt-6 mb-2">
        Visualizações
      </div>
      {VIEW_ITEMS.map(renderLink)}
    </nav>
  );
};

export const Sidebar: React.FC = () => {
  const { sidebarOpen, closeSidebar } = useUIStore();

  return (
    <>
      {/* Barra lateral fixa — desktop */}
      <aside className="w-64 bg-grey100 dark:bg-grey900/40 border-r border-grey200 dark:border-grey800 min-h-[calc(100vh-65px)] p-6 hidden md:block">
        <SidebarNav />
      </aside>

      {/* Drawer — mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeSidebar}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-light-background dark:bg-grey900 border-r border-grey200 dark:border-grey800 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <BrandName className="text-lg font-black" />
              <button
                onClick={closeSidebar}
                className="p-1.5 rounded-lg text-grey600 dark:text-grey400 hover:bg-grey200 dark:hover:bg-grey800 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarNav onNavigate={closeSidebar} />
          </aside>
        </div>
      )}
    </>
  );
};
