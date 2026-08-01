'use client';

import React, { useState, useEffect } from 'react';
import { Letter, DKMSettings } from '@/types';
import {
  getStoredLetters,
  saveLetterToStorage,
  deleteLetterFromStorage,
  getStoredSettings,
  saveSettingsToStorage,
  getDashboardMetrics,
  getMonthlyChartData,
} from '@/lib/storage';
import { ToastProvider } from '@/components/ui/Toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatCards } from '@/components/dashboard/StatCards';
import { LetterChart } from '@/components/dashboard/LetterChart';
import { RecentLettersTable } from '@/components/dashboard/RecentLettersTable';
import { LetterForm } from '@/components/surat-keluar/LetterForm';
import { SuratMasukForm } from '@/components/surat-masuk/SuratMasukForm';
import { ArsipTable } from '@/components/arsip/ArsipTable';
import { LetterDetailModal } from '@/components/arsip/LetterDetailModal';

import { Send, Inbox, Archive } from 'lucide-react';

function DashboardContent() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [settings, setSettings] = useState<DKMSettings>(getStoredSettings());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedLetterForModal, setSelectedLetterForModal] = useState<Letter | null>(null);

  // Load letters from storage on mount
  useEffect(() => {
    const loaded = getStoredLetters();
    setLetters(loaded);

    // Check system color scheme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Update dark mode class on HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSaveLetter = (newLetter: Letter) => {
    const updated = saveLetterToStorage(newLetter);
    setLetters(updated);
  };

  const handleDeleteLetter = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus arsip surat ini?')) {
      const updated = deleteLetterFromStorage(id);
      setLetters(updated);
    }
  };

  const handleSaveSettings = (newSettings: DKMSettings) => {
    const updated = saveSettingsToStorage(newSettings);
    setSettings(updated);
  };

  const metrics = getDashboardMetrics(letters);
  const chartData = getMonthlyChartData(letters, 2026);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#04140e] text-zinc-900 dark:text-zinc-100 flex font-sans transition-colors">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsOpenMobile={setIsOpenMobile}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Page Views */}
        <main className="p-4 sm:p-8 flex-1 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Quick Actions Header Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-emerald-600/40">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-[11px] font-extrabold uppercase tracking-wider">
                    Sistem Administrasi Masjid
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Selamat Datang di DKM Al-Kamil Admin
                  </h1>
                  <p className="text-xs text-emerald-100/90 max-w-xl leading-relaxed font-medium">
                    Pengelolaan surat masuk & surat keluar resmi masjid secara digital, otomatisasi penomoran, penandatanganan, dan arsip terintegrasi Google Drive.
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab('surat-keluar')}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 text-emerald-700" />
                    <span>Buat Surat Keluar</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('surat-masuk')}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Inbox className="w-4 h-4 text-emerald-300" />
                    <span>Input Surat Masuk</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('arsip')}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5"
                    title="Buka Arsip Surat"
                  >
                    <Archive className="w-4 h-4" />
                    <span className="hidden sm:inline">Arsip</span>
                  </button>
                </div>
              </div>

              {/* Metrics Stat Cards */}
              <StatCards metrics={metrics} onNavigate={setActiveTab} />

              {/* Main Grid: Monthly Chart & Recent Letters */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <LetterChart data={chartData} year={2026} />
                </div>
                <div className="lg:col-span-5">
                  <RecentLettersTable
                    letters={letters}
                    onSelectLetter={setSelectedLetterForModal}
                    onNavigate={setActiveTab}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SURAT KELUAR */}
          {activeTab === 'surat-keluar' && (
            <div className="animate-in fade-in duration-300">
              <LetterForm
                existingLetters={letters}
                settings={settings}
                onSaveLetter={handleSaveLetter}
                onNavigateArsip={() => setActiveTab('arsip')}
              />
            </div>
          )}

          {/* TAB 3: SURAT MASUK */}
          {activeTab === 'surat-masuk' && (
            <div className="animate-in fade-in duration-300">
              <SuratMasukForm
                onSaveLetter={handleSaveLetter}
                onNavigateArsip={() => setActiveTab('arsip')}
              />
            </div>
          )}

          {/* TAB 4: ARSIP SURAT */}
          {activeTab === 'arsip' && (
            <div className="animate-in fade-in duration-300">
              <ArsipTable
                letters={letters}
                onSelectLetter={setSelectedLetterForModal}
                onDeleteLetter={handleDeleteLetter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          )}


        </main>
      </div>

      {/* Detail Letter Modal Viewer */}
      <LetterDetailModal
        letter={selectedLetterForModal}
        settings={settings}
        onClose={() => setSelectedLetterForModal(null)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
