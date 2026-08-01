'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Send, 
  Inbox, 
  Archive, 
  Building2, 
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpenMobile, 
  setIsOpenMobile,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'surat-keluar', label: 'Surat Keluar', icon: Send, badge: 'Buat' },
    { id: 'surat-masuk', label: 'Surat Masuk', icon: Inbox, badge: 'Input' },
    { id: 'arsip', label: 'Arsip Surat', icon: Archive },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#061e15] border-r border-emerald-100 dark:border-emerald-900/60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-emerald-100/80 dark:border-emerald-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-emerald-950 dark:text-white tracking-tight leading-none">
                DKM AL-KAMIL
              </h1>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold mt-1">
                Administrasi Surat
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-emerald-300 dark:hover:text-white lg:hidden rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 mt-2 flex-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Menu Utama
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/40 dark:bg-emerald-600 dark:text-white'
                    : 'text-zinc-700 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Brand */}
        <div className="p-4 border-t border-emerald-100 dark:border-emerald-900/60 shrink-0">
          <p className="text-center text-[10px] text-emerald-600/60 dark:text-emerald-400/50 font-medium">
            Sistem Administrasi Surat DKM
          </p>
        </div>
      </aside>
    </>
  );
}
