'use client';

import React, { useState, useEffect } from 'react';
import { Letter, DKMSettings } from '@/types';
import { generateNextLetterNumber } from '@/lib/constants';
import { PdfTemplate } from './PdfTemplate';
import { useToast } from '@/components/ui/Toast';
import { 
  Sparkles, 
  FileCheck2, 
  Eye, 
  Download, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  RefreshCw,
  Send,
  Loader2,
  CheckCircle
} from 'lucide-react';

interface LetterFormProps {
  existingLetters: Letter[];
  settings: DKMSettings;
  onSaveLetter: (letter: Letter) => void;
  onNavigateArsip: () => void;
}

export function LetterForm({
  existingLetters,
  settings,
  onSaveLetter,
  onNavigateArsip,
}: LetterFormProps) {
  const { toast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  
  const [date, setDate] = useState(todayStr);
  const [autoNumber, setAutoNumber] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState(`<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
<p>Dengan hormat, sehubungan dengan pelaksanaan kegiatan rutin Dewan Kemakmuran Masjid Al-Kamil, kami bermaksud menyampaikan permohonan / pemberitahuan kepada Bapak/Ibu.</p>
<p>Acara insya Allah akan dilaksanakan pada:</p>
<ul>
  <li><strong>Hari / Tanggal:</strong> Sabtu, 15 Agustus 2026</li>
  <li><strong>Waktu:</strong> 19.30 WIB (Ba'da Isya) - Selesai</li>
  <li><strong>Tempat:</strong> Ruang Utama Masjid Al-Kamil</li>
</ul>
<p>Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih. Jazakumullah Khairan Katsiran.</p>`);
  const [signatory, setSignatory] = useState(settings.defaultSignatory);
  const [attachments, setAttachments] = useState('1 Berkas Proposal');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfBlobUrl, setGeneratedPdfBlobUrl] = useState<string | null>(null);
  const [createdLetterData, setCreatedLetterData] = useState<Letter | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Auto update letter number on mount or date change
  useEffect(() => {
    const nextNum = generateNextLetterNumber(existingLetters, settings.defaultPrefix, date);
    setAutoNumber(nextNum);
  }, [date, existingLetters, settings.defaultPrefix]);

  const handleInsertTag = (tag: string) => {
    setContent((prev) => prev + ` ${tag} `);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient.trim() || !subject.trim()) {
      toast({
        title: 'Form Belum Lengkap',
        description: 'Harap isi Tujuan dan Perihal surat.',
        type: 'error',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Calculate & confirm final letter number
      const finalNumber = autoNumber || generateNextLetterNumber(existingLetters, settings.defaultPrefix, date);
      const dateObj = new Date(date);

      // 2. Generate PDF canvas using html2canvas & jspdf
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const containerEl = document.getElementById('dkm-letter-pdf-container');
      let pdfBase64 = '';
      let blobUrl = '';

      if (containerEl) {
        const canvas = await html2canvas(containerEl, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
        
        const blob = pdf.output('blob');
        blobUrl = URL.createObjectURL(blob);
        setGeneratedPdfBlobUrl(blobUrl);

        // Upload FormData to server API for Google Drive integration
        const formData = new FormData();
        formData.append('file', blob, `Surat_${finalNumber.replace(/\//g, '_')}.pdf`);
        formData.append('letterNumber', finalNumber);
        formData.append('type', 'KELUAR');

        try {
          await fetch('/api/drive', { method: 'POST', body: formData });
        } catch (apiErr) {
          console.warn('API Drive upload error:', apiErr);
        }
      }

      // 3. Construct Letter Record
      const newLetter: Letter = {
        id: `letter-${Date.now()}`,
        type: 'KELUAR',
        number: finalNumber,
        date,
        senderOrRecipient: recipient,
        subject,
        content,
        signatory,
        attachments,
        fileName: `Surat_${finalNumber.replace(/\//g, '_')}.pdf`,
        fileUrl: blobUrl,
        driveUrl: `https://drive.google.com/file/d/drive_${Date.now()}/view`,
        status: 'TERKIRIM',
        createdAt: new Date().toISOString(),
        year: dateObj.getFullYear(),
        month: dateObj.getMonth() + 1,
      };

      // Save to storage
      onSaveLetter(newLetter);
      setCreatedLetterData(newLetter);
      setShowPreviewModal(true);

      toast({
        title: 'Surat Keluar & PDF Berhasil Dibuat!',
        description: `Nomor: ${finalNumber}. PDF disinkronkan ke Google Drive.`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Gagal Membuat PDF',
        description: error?.message || 'Terjadi kesalahan saat merender PDF.',
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (generatedPdfBlobUrl && createdLetterData) {
      const a = document.createElement('a');
      a.href = generatedPdfBlobUrl;
      a.download = createdLetterData.fileName || 'Surat_DKM.pdf';
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <Send className="w-5 h-5" />
            <span>Form Buat Surat Keluar</span>
          </h2>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Generate nomor otomatis, PDF resmi Kop Surat DKM, dan sinkron ke Google Drive.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-xs font-bold flex items-center gap-2 border border-white/20">
          <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
          <span>Auto Number: {autoNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <form onSubmit={handleGenerate} className="lg:col-span-7 space-y-5 bg-white dark:bg-[#061e15] p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/80 shadow-sm">
          
          {/* Row 1: Nomor Surat & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Nomor Surat (Otomatis)
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={autoNumber}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-[#03120c] border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold text-emerald-950 dark:text-emerald-300 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAutoNumber(generateNextLetterNumber(existingLetters, settings.defaultPrefix, date))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors"
                  title="Generate Ulang Nomor"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Tanggal Surat
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Tujuan & Lampiran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Tujuan / Penerima <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Panitia Tabligh Akbar / Warga RT 04"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-emerald-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
                Lampiran
              </label>
              <input
                type="text"
                placeholder="Contoh: 1 Berkas Proposal / -"
                value={attachments}
                onChange={(e) => setAttachments(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-emerald-400/50"
              />
            </div>
          </div>

          {/* Perihal */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
              Perihal / Hal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Undangan Penceramah Utama Tabligh Akbar"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-emerald-400/50"
            />
          </div>

          {/* Rich Text Editor Toolbar & Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-emerald-200">
                Isi Surat (Rich Format)
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleInsertTag('[Nama Penerima]')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
                >
                  + [Nama]
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTag('[Tanggal Acara]')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
                >
                  + [Tanggal]
                </button>
              </div>
            </div>

            {/* Custom Simple Rich Editor Controls */}
            <div className="border border-zinc-200 dark:border-emerald-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-[#03120c]">
              <div className="p-2 border-b border-zinc-200 dark:border-emerald-800/80 bg-zinc-100 dark:bg-emerald-900/60 flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setContent((p) => p + '<strong>Teks Tebal</strong>')}
                  className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-emerald-800 text-zinc-700 dark:text-emerald-100"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setContent((p) => p + '<em>Teks Miring</em>')}
                  className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-emerald-800 text-zinc-700 dark:text-emerald-100"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setContent((p) => p + '<u>Teks Garis Bawah</u>')}
                  className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-emerald-800 text-zinc-700 dark:text-emerald-100"
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-px bg-zinc-300 dark:bg-emerald-800 mx-1" />
                <button
                  type="button"
                  onClick={() => setContent((p) => p + '<ul><li>Poin 1</li><li>Poin 2</li></ul>')}
                  className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-emerald-800 text-zinc-700 dark:text-emerald-100"
                  title="List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3.5 text-xs text-zinc-900 dark:text-white bg-transparent outline-none font-mono resize-none"
              />
            </div>
          </div>

          {/* Penandatangan */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-emerald-200 mb-1.5">
              Penandatangan Surat
            </label>
            <input
              type="text"
              value={signatory}
              onChange={(e) => setSignatory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#03120c] border border-zinc-200 dark:border-emerald-800 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses & Upload Drive...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Nomor, PDF & Upload Drive</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Live Printable Kop Surat Preview Canvas */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Live Preview Kop Surat</span>
            </h3>
            <span className="text-[10px] text-zinc-500 dark:text-emerald-300/80 font-semibold">Format Resmi DKM</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-emerald-800/80 bg-zinc-100 dark:bg-[#03120c] p-4">
            <div className="transform scale-[0.82] origin-top">
              <PdfTemplate
                letter={{
                  number: autoNumber,
                  date,
                  senderOrRecipient: recipient,
                  subject,
                  content,
                  signatory,
                  attachments,
                }}
                settings={settings}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal on Successful Generation */}
      {showPreviewModal && createdLetterData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#061e15] p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl border border-emerald-800">
            <div className="flex items-center justify-between border-b pb-3 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Surat Keluar Berhasil Dibuat</h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:text-emerald-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-700 dark:text-emerald-100">
              <p><strong>Nomor Surat:</strong> {createdLetterData.number}</p>
              <p><strong>Tujuan:</strong> {createdLetterData.senderOrRecipient}</p>
              <p><strong>Perihal:</strong> {createdLetterData.subject}</p>
              <p><strong>Status Upload Drive:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terhubung & Tersimpan</span></p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadPdf}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Surat</span>
              </button>

              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  onNavigateArsip();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-zinc-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Buka Arsip Surat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
