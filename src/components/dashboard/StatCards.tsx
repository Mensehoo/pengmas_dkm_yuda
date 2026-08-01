'use client';

import React from 'react';
import { Inbox, Send, CalendarCheck, FileText, ArrowUpRight } from 'lucide-react';

interface StatCardsProps {
  metrics: {
    totalMasuk: number;
    totalKeluar: number;
    suratBulanIni: number;
    totalAll: number;
  };
  onNavigate: (tab: string) => void;
}

export function StatCards({ metrics, onNavigate }: StatCardsProps) {
  const cards = [
    {
      title: 'Total Surat Masuk',
      value: metrics.totalMasuk,
      subtitle: 'Surat diterima & diarsip',
      icon: Inbox,
      iconBg: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white',
      tabTarget: 'arsip',
    },
    {
      title: 'Total Surat Keluar',
      value: metrics.totalKeluar,
      subtitle: 'Surat diterbitkan DKM',
      icon: Send,
      iconBg: 'bg-teal-600 text-white dark:bg-teal-500 dark:text-white',
      tabTarget: 'arsip',
    },
    {
      title: 'Surat Bulan Ini',
      value: metrics.suratBulanIni,
      subtitle: 'Bulan Agustus 2026',
      icon: CalendarCheck,
      iconBg: 'bg-emerald-700 text-white dark:bg-emerald-400 dark:text-emerald-950',
      tabTarget: 'arsip',
    },
    {
      title: 'Total Arsip Dokumentasi',
      value: metrics.totalAll,
      subtitle: 'Tersimpan di Google Drive',
      icon: FileText,
      iconBg: 'bg-zinc-800 text-white dark:bg-zinc-700 dark:text-white',
      tabTarget: 'arsip',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onNavigate(card.tabTarget)}
            className="group relative p-5 rounded-2xl bg-white dark:bg-[#061e15] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-600 dark:text-emerald-200">
                {card.title}
              </span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {card.value}
              </h3>
              <div className="flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-300 group-hover:translate-x-0.5 transition-transform">
                <span>Lihat</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-emerald-300/80 mt-1 font-medium">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
