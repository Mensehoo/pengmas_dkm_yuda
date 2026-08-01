export type LetterType = 'MASUK' | 'KELUAR';

export interface Letter {
  id: string;
  type: LetterType;
  number: string; // e.g. 001/DKM-ALKAMIL/VIII/2026
  date: string; // YYYY-MM-DD
  senderOrRecipient: string; // Asal Surat (Masuk) or Tujuan (Keluar)
  subject: string; // Perihal
  content?: string; // HTML / Rich Text body content (Surat Keluar)
  signatory?: string; // Penandatangan (Surat Keluar)
  attachments?: string; // Lampiran info (Surat Keluar)
  notes?: string; // Keterangan (Surat Masuk)
  fileName?: string;
  fileUrl?: string; // Base64 or Blob preview URL
  driveUrl?: string; // Link Google Drive
  status: 'TERKIRIM' | 'DITERIMA' | 'PROSES' | 'DIARSIPKAN';
  createdAt: string;
  year: number;
  month: number; // 1-12
}

export interface DKMSettings {
  mosqueName: string; // e.g. DKM MASJID AL-KAMIL
  tagline: string; // e.g. Dewan Kemakmuran Masjid Al-Kamil
  address: string;
  phone: string;
  email: string;
  defaultPrefix: string; // e.g. DKM-ALKAMIL
  defaultSignatory: string; // e.g. H. Ahmad Dahlan (Ketua DKM)
  driveFolderId: string;
  sheetsSpreadsheetId: string;
  isGoogleConnected: boolean;
  googleServiceAccountEmail?: string;
}

export type LetterFilter = {
  search: string;
  type: 'ALL' | 'MASUK' | 'KELUAR';
  year: string; // 'ALL' or year string '2026'
  month: string; // 'ALL' or month string '1'..'12'
};

export interface ChartData {
  monthName: string;
  monthIndex: number;
  suratMasuk: number;
  suratKeluar: number;
}
