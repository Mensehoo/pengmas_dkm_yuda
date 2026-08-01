'use client';

import React, { useState } from 'react';
import { DKMSettings } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Settings, Save, Cloud, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  settings: DKMSettings;
  onSaveSettings: (settings: DKMSettings) => void;
}

export function SettingsModal({ settings, onSaveSettings }: SettingsModalProps) {
  const { toast } = useToast();

  const [form, setForm] = useState<DKMSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    toast({
      title: 'Pengaturan Disimpan!',
      description: 'Konfigurasi DKM & Google API berhasil diperbarui.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md">
        <h2 className="text-lg font-extrabold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <span>Pengaturan DKM & Integrasi Google Cloud</span>
        </h2>
        <p className="text-xs text-emerald-100 mt-1 font-medium">
          Kelola profil Kop Surat DKM Masjid Al-Kamil, format nomor surat, serta folder Google Drive & Google Sheets API.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: DKM Kop Surat Metadata */}
        <div className="bg-white dark:bg-[#061e15] p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white border-b pb-2 dark:border-emerald-800/80">
            Identitas Kop Surat Masjid
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Nama Masjid / Lembaga DKM
              </label>
              <input
                type="text"
                value={form.mosqueName}
                onChange={(e) => setForm({ ...form, mosqueName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-extrabold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Prefix Penomoran Surat
              </label>
              <input
                type="text"
                value={form.defaultPrefix}
                onChange={(e) => setForm({ ...form, defaultPrefix: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-extrabold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
              Alamat Lengkap Masjid
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Telepon / Contact Person
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Email Sekretariat
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Google API Integrations */}
        <div className="bg-white dark:bg-[#061e15] p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2 dark:border-emerald-800/80">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Integrasi Backend: Google Drive API & Google Sheets API</span>
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700">
              Gratis (Vercel Ready)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
            <p className="font-extrabold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sistem API Backend Terpisah Dari Web Client</span>
            </p>
            <p className="text-[11px] leading-relaxed font-medium">
              Integrasi Google Drive API & Sheets API diatur via Server Endpoint (`/api/drive` & `/api/letters`).
              Variabel kredensial Service Account disimpan aman di Vercel Environment Variables (`GOOGLE_SERVICE_ACCOUNT_EMAIL` & `GOOGLE_PRIVATE_KEY`).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Google Drive Folder ID
              </label>
              <input
                type="text"
                value={form.driveFolderId}
                onChange={(e) => setForm({ ...form, driveFolderId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Google Sheets Spreadsheet ID
              </label>
              <input
                type="text"
                value={form.sheetsSpreadsheetId}
                onChange={(e) => setForm({ ...form, sheetsSpreadsheetId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/30 flex items-center gap-2 transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
