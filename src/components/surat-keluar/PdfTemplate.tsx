'use client';

import React from 'react';
import { Letter, DKMSettings } from '@/types';
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PdfTemplateProps {
  letter: Partial<Letter>;
  settings: DKMSettings;
}

export function PdfTemplate({ letter, settings }: PdfTemplateProps) {
  return (
    <div
      id="dkm-letter-pdf-container"
      className="bg-white text-black p-8 sm:p-12 max-w-[800px] mx-auto shadow-2xl rounded-sm border border-zinc-200 text-sm leading-relaxed"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {/* KOP SURAT HEADER */}
      <div className="flex items-center gap-6 border-b-4 border-emerald-800 pb-4 mb-1">
        <div className="w-20 h-20 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
          <Building2 className="w-10 h-10" />
        </div>
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-emerald-900 font-sans">
            {settings.mosqueName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-emerald-800 font-sans">
            {settings.tagline}
          </p>
          <p className="text-[11px] text-zinc-600 font-sans mt-0.5">
            {settings.address} | Telp: {settings.phone}
          </p>
          <p className="text-[11px] text-zinc-600 font-sans">
            Email: {settings.email}
          </p>
        </div>
      </div>
      {/* Thin line under kop */}
      <div className="border-b border-emerald-900 mb-6" />

      {/* METADATA BAR (Nomor & Tanggal) */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 font-sans text-xs">
        <div className="space-y-1">
          <p>
            <strong className="w-24 inline-block">Nomor</strong>: {letter.number || '001/DKM-ALKAMIL/VIII/2026'}
          </p>
          <p>
            <strong className="w-24 inline-block">Lampiran</strong>: {letter.attachments || '-'}
          </p>
          <p>
            <strong className="w-24 inline-block">Perihal</strong>: <span className="font-bold underline">{letter.subject || 'Permohonan Kegiatan DKM'}</span>
          </p>
        </div>

        <div className="text-right sm:text-right">
          <p className="font-medium text-zinc-700">
            Bandung, {letter.date || new Date().toISOString().split('T')[0]}
          </p>
        </div>
      </div>

      {/* RECIPIENT */}
      <div className="mb-6 font-sans text-xs space-y-1">
        <p>Kepada Yth.</p>
        <p className="font-bold text-sm text-zinc-900">{letter.senderOrRecipient || 'Bapak/Ibu Penerima Surat'}</p>
        <p className="text-zinc-600">Di Tempat</p>
      </div>

      {/* LETTER BODY CONTENT */}
      <div className="letter-body my-8 text-xs sm:text-sm text-zinc-900 space-y-4 leading-relaxed font-serif">
        {letter.content ? (
          <div dangerouslySetInnerHTML={{ __html: letter.content }} />
        ) : (
          <div>
            <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
            <p>
              Dengan ini kami sampaikan informasi resmi dari Dewan Kemakmuran Masjid Al-Kamil.
            </p>
          </div>
        )}
      </div>

      {/* SIGNATURE BLOCK */}
      <div className="mt-12 flex justify-end font-sans">
        <div className="text-center w-64 space-y-2">
          <p className="text-xs text-zinc-700 font-semibold">
            Dewan Kemakmuran Masjid Al-Kamil
          </p>
          <p className="text-[11px] text-zinc-500">Ketua / Sekretaris DKM</p>

          {/* STAMP / SIGNATURE PLACEHOLDER */}
          <div className="h-20 flex items-center justify-center my-2 relative">
            <div className="w-24 h-24 border-2 border-dashed border-emerald-600/40 rounded-full flex flex-col items-center justify-center text-emerald-800 opacity-80 transform -rotate-12 bg-emerald-50/30 p-2">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <span className="text-[8px] font-bold tracking-tighter uppercase mt-0.5">TERVERIFIKASI DKM</span>
            </div>
          </div>

          <p className="text-xs font-bold text-zinc-900 underline">
            {letter.signatory || settings.defaultSignatory}
          </p>
        </div>
      </div>

      {/* FOOTER ARCHIVE STAMP */}
      <div className="mt-12 pt-3 border-t border-zinc-200 text-[10px] text-zinc-400 font-sans flex justify-between items-center">
        <span>Sistem Administrasi Surat DKM Masjid Al-Kamil &copy; 2026</span>
        <span>Dokumen Resmi Terarsip</span>
      </div>
    </div>
  );
}
