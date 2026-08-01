import { Letter, DKMSettings } from '@/types';

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const ROMAN_MONTHS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
};

export function toRomanMonth(monthNumber: number): string {
  return ROMAN_MONTHS[monthNumber] || 'VIII';
}

export const DEFAULT_SETTINGS: DKMSettings = {
  mosqueName: 'DKM MASJID AL-KAMIL',
  tagline: 'Dewan Kemakmuran Masjid Al-Kamil',
  address: 'Jl. Raya Utama No. 45, Kecamatan Sukajadi, Kota Bandung',
  phone: '0812-3456-7890',
  email: 'sekretariat@dkmalkamil.or.id',
  defaultPrefix: 'DKM-ALKAMIL',
  defaultSignatory: 'H. Yuda Pratama, S.Ag (Ketua DKM)',
  driveFolderId: '1aB2cD3e4f5g6h7i8j9k0_DKMARCHIVE',
  sheetsSpreadsheetId: '1Sheet_DKM_Surat_Database_2026',
  isGoogleConnected: true,
  googleServiceAccountEmail: 'dkm-archiver@dkm-system.iam.gserviceaccount.com'
};

export const INITIAL_LETTERS: Letter[] = [
  {
    id: 'letter-001',
    type: 'KELUAR',
    number: '001/DKM-ALKAMIL/VIII/2026',
    date: '2026-08-01',
    senderOrRecipient: 'Panitia Tabligh Akbar Kecamatan Sukajadi',
    subject: 'Permohonan Penceramah Utama & Izin Tempat',
    content: `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
<p>Dengan hormat, sehubungan dengan persiapan kegiatan peringatan <strong>HUT RI dan Hari Besar Islam</strong>, Dewan Kemakmuran Masjid Al-Kamil bermaksud mengundang Bapak Ustadz K.H. Ahmad Fauzi untuk menjadi penceramah utama dalam acara Tabligh Akbar.</p>
<p>Acara insya Allah akan dilaksanakan pada:</p>
<ul>
  <li><strong>Hari/Tanggal:</strong> Sabtu, 15 Agustus 2026</li>
  <li><strong>Waktu:</strong> 19.30 WIB (Ba'da Isya) - Selesai</li>
  <li><strong>Tempat:</strong> Ruang Utama Masjid Al-Kamil</li>
</ul>
<p>Demikian surat permohonan ini kami sampaikan. Atas perhatian dan kesediaan Bapak, kami ucapkan terima kasih. Jazakumullah Khairan Katsiran.</p>`,
    signatory: 'H. Yuda Pratama, S.Ag (Ketua DKM)',
    attachments: '1 Berkas Proposal Kegiatan',
    fileName: 'Surat_001_DKM_ALKAMIL_VIII_2026.pdf',
    driveUrl: 'https://drive.google.com/file/d/1_sample_surat_keluar_001/view',
    status: 'TERKIRIM',
    createdAt: '2026-08-01T08:30:00Z',
    year: 2026,
    month: 8
  },
  {
    id: 'letter-002',
    type: 'MASUK',
    number: '045/KEMAG-BDG/VII/2026',
    date: '2026-07-28',
    senderOrRecipient: 'Kementerian Agama Kota Bandung',
    subject: 'Himbauan Pelaksanaan Program Pelatihan Manasik Haji & Umrah',
    notes: 'Surat dinas resmi Kemenag perihal koordinasi jadwal manasik haji tingkat kecamatan.',
    fileName: 'Surat_Masuk_Kemenag_Manasik_2026.pdf',
    driveUrl: 'https://drive.google.com/file/d/2_sample_surat_masuk_kemenag/view',
    status: 'DITERIMA',
    createdAt: '2026-07-28T10:15:00Z',
    year: 2026,
    month: 7
  },
  {
    id: 'letter-003',
    type: 'KELUAR',
    number: '002/DKM-ALKAMIL/VII/2026',
    date: '2026-07-20',
    senderOrRecipient: 'Pengurus RT 04 / RW 08 Sukajadi',
    subject: 'Undangan Rapat Silahturahmi Warga & Koordinasi Qurban',
    content: `<p>Assalamu'alaikum Wr. Wb.,</p><p>Mengundang pengurus RT/RW setempat dalam konsolidasi persiapan pemotongan hewan qurban DKM Masjid Al-Kamil.</p>`,
    signatory: 'Ust. Ridwan Hasbi (Sekretaris DKM)',
    attachments: 'Draft Susunan Panitia Qurban',
    fileName: 'Surat_002_Undangan_Qurban.pdf',
    driveUrl: 'https://drive.google.com/file/d/3_sample_surat_keluar_qurban/view',
    status: 'TERKIRIM',
    createdAt: '2026-07-20T14:00:00Z',
    year: 2026,
    month: 7
  },
  {
    id: 'letter-004',
    type: 'MASUK',
    number: '112/LAZ-AMAL/VI/2026',
    date: '2026-06-15',
    senderOrRecipient: 'Lembaga Amil Zakat Nasional (LAZ)',
    subject: 'Permohonan Kerjasama Penyaluran Beasiswa Santri Yatim',
    notes: 'Penawaran program beasiswa untuk 25 santri kurang mampu di lingkungan masjid.',
    fileName: 'Surat_Masuk_LAZ_Beasiswa.pdf',
    driveUrl: 'https://drive.google.com/file/d/4_sample_laz_beasiswa/view',
    status: 'DIARSIPKAN',
    createdAt: '2026-06-15T09:00:00Z',
    year: 2026,
    month: 6
  },
  {
    id: 'letter-005',
    type: 'KELUAR',
    number: '001/DKM-ALKAMIL/VI/2026',
    date: '2026-06-02',
    senderOrRecipient: 'Bank Syariah Indonesia (BSI) Cabang Bandung',
    subject: 'Permohonan Pembaruan Rekening Infaq & Sedekah Masjid',
    content: `<p>Permohonan spesimen tanda tangan dan pembaruan struktur pengurus pada rekening DKM.</p>`,
    signatory: 'H. Yuda Pratama, S.Ag (Ketua DKM)',
    attachments: 'SK Kepengurusan DKM 2026-2029',
    fileName: 'Surat_001_BSI_Rekening.pdf',
    driveUrl: 'https://drive.google.com/file/d/5_sample_bsi_rekening/view',
    status: 'TERKIRIM',
    createdAt: '2026-06-02T11:20:00Z',
    year: 2026,
    month: 6
  },
  {
    id: 'letter-006',
    type: 'MASUK',
    number: '009/POLSEK-SKJD/V/2026',
    date: '2026-05-18',
    senderOrRecipient: 'Polsek Sukajadi Bandung',
    subject: 'Surat Izin Pengamanan Objek Vital & Posko Ramadhan',
    notes: 'Surat konfirmasi pengamanan area parkir dan jamaah.',
    fileName: 'Surat_Masuk_Polsek_Pengamanan.pdf',
    driveUrl: 'https://drive.google.com/file/d/6_sample_polsek_izin/view',
    status: 'DITERIMA',
    createdAt: '2026-05-18T16:45:00Z',
    year: 2026,
    month: 5
  }
];

export function generateNextLetterNumber(
  existingLetters: Letter[],
  prefix: string = 'DKM-ALKAMIL',
  dateString?: string
): string {
  const dateObj = dateString ? new Date(dateString) : new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 1-12
  const romanMonth = toRomanMonth(month);

  // Count existing outgoing letters in this month and year
  const outgoingLettersInMonth = existingLetters.filter(
    (l) => l.type === 'KELUAR' && l.year === year && l.month === month
  );

  const nextSeq = outgoingLettersInMonth.length + 1;
  const seqFormatted = String(nextSeq).padStart(3, '0');

  return `${seqFormatted}/${prefix}/${romanMonth}/${year}`;
}
