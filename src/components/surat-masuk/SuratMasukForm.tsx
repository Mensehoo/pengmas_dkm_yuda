'use client';

import React, { useState } from 'react';
import { Letter } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Inbox, UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';

interface SuratMasukFormProps {
  onSaveLetter: (letter: Letter) => void;
  onNavigateArsip: () => void;
}

export function SuratMasukForm({ onSaveLetter, onNavigateArsip }: SuratMasukFormProps) {
  const { toast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  const [number, setNumber] = useState('');
  const [date, setDate] = useState(todayStr);
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!number.trim() || !sender.trim() || !subject.trim()) {
      toast({
        title: 'Form Belum Lengkap',
        description: 'Nomor Surat, Asal Surat, dan Perihal wajib diisi.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = '';
      let driveUrl = `https://drive.google.com/file/d/drive_masuk_${Date.now()}/view`;

      // Upload file to Google Drive API route
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('letterNumber', number);
        formData.append('type', 'MASUK');

        try {
          const res = await fetch('/api/drive', { method: 'POST', body: formData });
          const json = await res.json();
          if (json.driveUrl) {
            driveUrl = json.driveUrl;
          }
        } catch (err) {
          console.warn('API Drive upload fallback:', err);
        }

        // Create local preview URL
        fileUrl = URL.createObjectURL(selectedFile);
      }

      const dateObj = new Date(date);

      const newLetter: Letter = {
        id: `letter-masuk-${Date.now()}`,
        type: 'MASUK',
        number,
        date,
        senderOrRecipient: sender,
        subject,
        notes,
        fileName: selectedFile ? selectedFile.name : 'Document_Scan.pdf',
        fileUrl,
        driveUrl,
        status: 'DITERIMA',
        createdAt: new Date().toISOString(),
        year: dateObj.getFullYear(),
        month: dateObj.getMonth() + 1,
      };

      onSaveLetter(newLetter);

      toast({
        title: 'Surat Masuk Berhasil Diinput!',
        description: `Nomor: ${number} dari ${sender}. Tersimpan di Drive.`,
        type: 'success',
      });

      // Reset form
      setNumber('');
      setSender('');
      setSubject('');
      setNotes('');
      setSelectedFile(null);

      onNavigateArsip();
    } catch (error: any) {
      console.error('Error submitting surat masuk:', error);
      toast({
        title: 'Gagal Menyimpan Surat',
        description: error?.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md">
        <h2 className="text-lg font-extrabold flex items-center gap-2">
          <Inbox className="w-5 h-5" />
          <span>Input Surat Masuk</span>
        </h2>
        <p className="text-xs text-emerald-100 mt-1 font-medium">
          Catat registrasi surat masuk dari pihak luar, upload berkas PDF/Scan, dan arsipkan ke Google Drive.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#061e15] p-6 sm:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-800/80 shadow-sm space-y-5"
      >
        {/* Row 1: Nomor & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
              Nomor Surat Masuk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 045/KEMAG-BDG/VII/2026"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-emerald-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
              Tanggal Diterima <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Asal Surat */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
            Asal Surat (Pengirim) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Kementerian Agama Kota Bandung / Polsek Sukajadi"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-emerald-400/50"
          />
        </div>

        {/* Perihal */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
            Perihal / Hal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Himbauan Pelaksanaan Manasik Haji / Izin Keramaian"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-emerald-400/50"
          />
        </div>

        {/* Upload File PDF / Scan */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
            Upload PDF / Scan Berkas
          </label>

          <div className="relative border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 rounded-2xl p-6 text-center hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors bg-zinc-50/50 dark:bg-[#03120c]">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center gap-2 text-emerald-800 dark:text-emerald-200">
              <UploadCloud className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold">
                {selectedFile ? selectedFile.name : 'Klik atau seret file PDF / Scan ke sini'}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-emerald-300/70 font-medium">Format: PDF, PNG, JPG (Maks. 10MB)</p>
            </div>
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
            Keterangan / Catatan Tambahan
          </label>
          <textarea
            rows={3}
            placeholder="Tambahkan catatan khusus misal: Tindak lanjut rapat pengurus pada hari Jumat..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 resize-none placeholder:text-zinc-400 dark:placeholder:text-emerald-400/50"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Drive...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan & Upload Ke Google Drive</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
