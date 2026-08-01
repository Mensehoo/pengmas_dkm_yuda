'use client';

import React from 'react';
import { Menu, Moon, Sun, Search, Plus, ChevronRight } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsOpenMobile: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({
  activeTab,
  setActiveTab,
  setIsOpenMobile,
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'surat-keluar':
        return 'Buat Surat Keluar';
      case 'surat-masuk':
        return 'Input Surat Masuk';
      case 'arsip':
        return 'Arsip Surat Masjid';
      case 'settings':
        return 'Integrasi Google Drive & Sheets';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/90 dark:bg-[#061e15]/90 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900/60 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left section: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 lg:hidden hover:bg-emerald-100 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-emerald-300/80">
            <span>DKM Al-Kamil</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-emerald-700 dark:text-emerald-300 capitalize">
              {activeTab.replace('-', ' ')}
            </span>
          </nav>
          <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {getTabTitle(activeTab)}
          </h2>
        </div>
      </div>

      {/* Right section: Search, Dark Mode, Actions & Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block w-60 xl:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-emerald-400/80" />
          <input
            type="text"
            placeholder="Cari nomor, perihal, asal..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'arsip') {
                setActiveTab('arsip');
              }
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-[#03120c] border border-transparent dark:border-emerald-800/80 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#061e15] outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-emerald-400/50"
          />
        </div>

        {/* Dark mode switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-emerald-900/60 text-zinc-600 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Quick Action: Buat Surat Keluar */}
        <button
          onClick={() => setActiveTab('surat-keluar')}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat</span>
        </button>

        {/* Admin profile avatar badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200 dark:border-emerald-900/60">
          <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs border-2 border-emerald-500/40 shrink-0">
            DKM
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Sekretariat DKM</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-300 font-semibold">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
