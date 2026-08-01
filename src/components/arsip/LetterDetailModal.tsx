'use client';

import React from 'react';
import { Letter, DKMSettings } from '@/types';
import { PdfTemplate } from '@/components/surat-keluar/PdfTemplate';
import { X, Download, ExternalLink, FileText, Send, Inbox, ShieldCheck, Calendar, User } from 'lucide-react';

interface LetterDetailModalProps {
  letter: Letter | null;
  settings: DKMSettings;
  onClose: () => void;
}

export function LetterDetailModal({ letter, settings, onClose }: LetterDetailModalProps) {
  if (!letter) return null;

  const isKeluar = letter.type === 'KELUAR';

  const handleDownload = () => {
    if (letter.fileUrl) {
      const a = document.createElement('a');
      a.href = letter.fileUrl;
      a.download = letter.fileName || `Surat_${letter.number.replace(/\//g, '_')}.pdf`;
      a.click();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-emerald-950 max-w-4xl w-full rounded-2xl border border-emerald-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              {isKeluar ? <Send className="w-5 h-5" /> : <Inbox className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Detail Dokumen Surat</h3>
              <p className="text-xs text-emerald-200">{letter.number}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Bar: Download & Drive Links */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dokumen Resmi Terverifikasi Sistem DKM</span>
            </div>

            <div className="flex items-center gap-2">
              {letter.driveUrl && (
                <a
                  href={letter.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Drive</span>
                </a>
              )}

              <button
                onClick={handleDownload}
                className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Metadata Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-emerald-950/60 border border-zinc-200 dark:border-emerald-900/60 space-y-1">
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Jenis Surat</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                {isKeluar ? 'Surat Keluar DKM' : 'Surat Masuk (Eksternal)'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-emerald-950/60 border border-zinc-200 dark:border-emerald-900/60 space-y-1">
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Pengirim / Tujuan</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {letter.senderOrRecipient}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-emerald-950/60 border border-zinc-200 dark:border-emerald-900/60 space-y-1">
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Tanggal Dokumentasi</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                {letter.date}
              </p>
            </div>
          </div>

          {/* Subject & Notes */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-emerald-950/40 border border-zinc-200 dark:border-emerald-900/60 space-y-2">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Perihal / Hal</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{letter.subject}</p>
            </div>
            {letter.notes && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Catatan / Keterangan</p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">{letter.notes}</p>
              </div>
            )}
          </div>

          {/* PDF Visual Preview Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Preview Dokumen PDF
            </h4>

            {isKeluar ? (
              <div className="p-4 bg-zinc-100 dark:bg-emerald-950/60 rounded-xl border border-zinc-200 dark:border-emerald-900 overflow-x-auto">
                <PdfTemplate letter={letter} settings={settings} />
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-100 dark:bg-emerald-950/60 rounded-xl border border-zinc-200 dark:border-emerald-900 space-y-3">
                <FileText className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Berkas Scan Surat Masuk</p>
                  <p className="text-xs text-zinc-500">{letter.fileName}</p>
                </div>
                {letter.fileUrl && (
                  <a
                    href={letter.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                  >
                    <span>Buka File Scan (Full Window)</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
