'use client';

import React, { useState } from 'react';
import { Letter, LetterFilter } from '@/types';
import { filterLetters } from '@/lib/storage';
import { INDONESIAN_MONTHS } from '@/lib/constants';
import { 
  Search, 
  Send, 
  Inbox, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

interface ArsipTableProps {
  letters: Letter[];
  onSelectLetter: (letter: Letter) => void;
  onDeleteLetter: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ArsipTable({
  letters,
  onSelectLetter,
  onDeleteLetter,
  searchQuery,
  setSearchQuery,
}: ArsipTableProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'MASUK' | 'KELUAR'>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'number'>('date-desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filters: LetterFilter = {
    search: searchQuery,
    type: filterType,
    year: filterYear,
    month: filterMonth,
  };

  let filtered = filterLetters(letters, filters);

  // Sorting logic
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return a.number.localeCompare(b.number);
    }
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLetters = filtered.slice(startIndex, startIndex + itemsPerPage);

  const availableYears = Array.from(new Set(letters.map((l) => l.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#061e15] border border-emerald-100 dark:border-emerald-800/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-emerald-400/80" />
            <input
              type="text"
              placeholder="Cari nomor surat, perihal, pengirim, atau tujuan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-zinc-900 dark:text-white outline-none focus:border-emerald-500 font-medium placeholder:text-zinc-400 dark:placeholder:text-emerald-400/50"
            />
          </div>

          {/* Filters & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Filter Jenis */}
            <select
              value={filterType}
              onChange={(e: any) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 font-semibold outline-none focus:border-emerald-500 text-zinc-800 dark:text-white"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="MASUK">Surat Masuk</option>
              <option value="KELUAR">Surat Keluar</option>
            </select>

            {/* Filter Tahun */}
            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 font-semibold outline-none focus:border-emerald-500 text-zinc-800 dark:text-white"
            >
              <option value="ALL">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  Tahun {yr}
                </option>
              ))}
            </select>

            {/* Filter Bulan */}
            <select
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 font-semibold outline-none focus:border-emerald-500 text-zinc-800 dark:text-white"
            >
              <option value="ALL">Semua Bulan</option>
              {INDONESIAN_MONTHS.map((m, idx) => (
                <option key={idx} value={String(idx + 1)}>
                  {m}
                </option>
              ))}
            </select>

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 font-semibold outline-none focus:border-emerald-500 text-zinc-800 dark:text-white"
            >
              <option value="date-desc">Terbaru</option>
              <option value="date-asc">Terlama</option>
              <option value="number">Nomor Surat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="rounded-2xl bg-white dark:bg-[#061e15] border border-emerald-100 dark:border-emerald-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/70 dark:bg-[#0a291d] border-b border-emerald-100 dark:border-emerald-800 text-[11px] font-extrabold text-emerald-900 dark:text-emerald-100 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nomor Surat</th>
                <th className="py-3.5 px-3">Jenis</th>
                <th className="py-3.5 px-3">Perihal</th>
                <th className="py-3.5 px-3">Asal / Tujuan</th>
                <th className="py-3.5 px-3">Tanggal</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-emerald-800/40 text-xs">
              {currentLetters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 dark:text-emerald-300/60">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-emerald-400/50" />
                    <p className="font-bold text-sm text-zinc-700 dark:text-emerald-200">Tidak ada dokumen surat ditemukan</p>
                    <p className="text-xs text-zinc-500 dark:text-emerald-300/70 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                  </td>
                </tr>
              ) : (
                currentLetters.map((letter) => {
                  const isKeluar = letter.type === 'KELUAR';
                  return (
                    <tr
                      key={letter.id}
                      className="hover:bg-emerald-50/70 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      {/* Nomor */}
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                        {letter.number}
                      </td>

                      {/* Jenis Badge */}
                      <td className="py-3.5 px-3">
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

                      {/* Perihal */}
                      <td className="py-3.5 px-3 text-zinc-800 dark:text-emerald-100 max-w-[220px] truncate font-semibold">
                        {letter.subject}
                      </td>

                      {/* Asal / Tujuan */}
                      <td className="py-3.5 px-3 text-zinc-600 dark:text-emerald-200 max-w-[180px] truncate font-medium">
                        {letter.senderOrRecipient}
                      </td>

                      {/* Tanggal */}
                      <td className="py-3.5 px-3 text-zinc-500 dark:text-emerald-300/80 whitespace-nowrap font-medium">
                        {letter.date}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-emerald-900 text-zinc-700 dark:text-emerald-200 text-[10px] font-bold border border-transparent dark:border-emerald-700/50">
                          {letter.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onSelectLetter(letter)}
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                          title="Detail Surat & PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>

                        <button
                          onClick={() => onDeleteLetter(letter.id)}
                          className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                          title="Hapus Surat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-zinc-50/90 dark:bg-[#03120c] border-t border-zinc-100 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-emerald-200">
          <span>
            Menampilkan <strong>{filtered.length === 0 ? 0 : startIndex + 1}</strong> -{' '}
            <strong>{Math.min(startIndex + itemsPerPage, filtered.length)}</strong> dari{' '}
            <strong>{filtered.length}</strong> total dokumen
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-lg bg-white dark:bg-emerald-900/60 border border-zinc-200 dark:border-emerald-800 text-zinc-800 dark:text-white disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-emerald-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-zinc-800 dark:text-white">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-2 rounded-lg bg-white dark:bg-emerald-900/60 border border-zinc-200 dark:border-emerald-800 text-zinc-800 dark:text-white disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-emerald-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
