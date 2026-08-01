'use client';

import React from 'react';
import { Letter } from '@/types';
import { Send, Inbox, ArrowRight, Eye } from 'lucide-react';

interface RecentLettersTableProps {
  letters: Letter[];
  onSelectLetter: (letter: Letter) => void;
  onNavigate: (tab: string) => void;
}

export function RecentLettersTable({
  letters,
  onSelectLetter,
  onNavigate,
}: RecentLettersTableProps) {
  const recentList = letters.slice(0, 5);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#061e15] border border-emerald-100 dark:border-emerald-800/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Surat Terbaru
          </h3>
          <p className="text-xs text-zinc-500 dark:text-emerald-200/90 mt-0.5 font-medium">
            Daftar 5 aktivitas transaksi surat terakhir di sistem DKM.
          </p>
        </div>

        <button
          onClick={() => onNavigate('arsip')}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
        >
          <span>Lihat Semua Arsip</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-emerald-800/60 text-[11px] font-bold text-zinc-500 dark:text-emerald-300 uppercase tracking-wider">
              <th className="pb-3 px-2">Jenis</th>
              <th className="pb-3 px-3">Nomor Surat</th>
              <th className="pb-3 px-3">Asal / Tujuan</th>
              <th className="pb-3 px-3">Perihal</th>
              <th className="pb-3 px-3">Tanggal</th>
              <th className="pb-3 px-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-emerald-800/40 text-xs">
            {recentList.map((letter) => {
              const isKeluar = letter.type === 'KELUAR';
              return (
                <tr
                  key={letter.id}
                  className="hover:bg-emerald-50/70 dark:hover:bg-emerald-900/50 transition-colors group"
                >
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isKeluar
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      }`}
                    >
                      {isKeluar ? (
                        <>
                          <Send className="w-3 h-3" /> Keluar
                        </>
                      ) : (
                        <>
                          <Inbox className="w-3 h-3" /> Masuk
                        </>
                      )}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                    {letter.number}
                  </td>

                  <td className="py-3 px-3 text-zinc-700 dark:text-emerald-100 max-w-[180px] truncate">
                    {letter.senderOrRecipient}
                  </td>

                  <td className="py-3 px-3 text-zinc-800 dark:text-emerald-100 max-w-[220px] truncate font-semibold">
                    {letter.subject}
                  </td>

                  <td className="py-3 px-3 text-zinc-500 dark:text-emerald-300/80 whitespace-nowrap font-medium">
                    {letter.date}
                  </td>

                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => onSelectLetter(letter)}
                      className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
