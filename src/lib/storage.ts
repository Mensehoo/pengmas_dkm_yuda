import { Letter, DKMSettings, LetterFilter, ChartData } from '@/types';
import { INITIAL_LETTERS, DEFAULT_SETTINGS, INDONESIAN_MONTHS } from './constants';

const LETTERS_STORAGE_KEY = 'dkm_surat_letters_v1';
const SETTINGS_STORAGE_KEY = 'dkm_surat_settings_v1';

export function getStoredLetters(): Letter[] {
  if (typeof window === 'undefined') return INITIAL_LETTERS;
  try {
    const item = localStorage.getItem(LETTERS_STORAGE_KEY);
    if (!item) {
      localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(INITIAL_LETTERS));
      return INITIAL_LETTERS;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error('Error reading letters from storage:', error);
    return INITIAL_LETTERS;
  }
}

export function saveLetterToStorage(letter: Letter): Letter[] {
  const current = getStoredLetters();
  const updated = [letter, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteLetterFromStorage(id: string): Letter[] {
  const current = getStoredLetters();
  const updated = current.filter((l) => l.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function updateLetterInStorage(letter: Letter): Letter[] {
  const current = getStoredLetters();
  const updated = current.map((l) => (l.id === letter.id ? letter : l));
  if (typeof window !== 'undefined') {
    localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function getStoredSettings(): DKMSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const item = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!item) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(item) };
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: DKMSettings): DKMSettings {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }
  return settings;
}

export function getDashboardMetrics(letters: Letter[]) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const totalMasuk = letters.filter((l) => l.type === 'MASUK').length;
  const totalKeluar = letters.filter((l) => l.type === 'KELUAR').length;
  
  const suratBulanIni = letters.filter(
    (l) => l.year === currentYear && l.month === currentMonth
  ).length;

  return {
    totalMasuk,
    totalKeluar,
    suratBulanIni,
    totalAll: letters.length
  };
}

export function getMonthlyChartData(letters: Letter[], year: number = 2026): ChartData[] {
  return INDONESIAN_MONTHS.map((monthName, index) => {
    const monthIndex = index + 1;
    const monthLetters = letters.filter(
      (l) => l.year === year && l.month === monthIndex
    );
    
    return {
      monthName: monthName.substring(0, 3), // e.g. Jan, Feb, Mar
      monthIndex,
      suratMasuk: monthLetters.filter((l) => l.type === 'MASUK').length,
      suratKeluar: monthLetters.filter((l) => l.type === 'KELUAR').length
    };
  });
}

export function filterLetters(letters: Letter[], filters: LetterFilter): Letter[] {
  return letters.filter((letter) => {
    // Search query check
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matchNumber = letter.number.toLowerCase().includes(q);
      const matchSubject = letter.subject.toLowerCase().includes(q);
      const matchSenderOrRecipient = letter.senderOrRecipient.toLowerCase().includes(q);
      const matchNotes = letter.notes?.toLowerCase().includes(q) || false;
      if (!matchNumber && !matchSubject && !matchSenderOrRecipient && !matchNotes) {
        return false;
      }
    }

    // Type filter check
    if (filters.type !== 'ALL' && letter.type !== filters.type) {
      return false;
    }

    // Year filter check
    if (filters.year !== 'ALL' && String(letter.year) !== filters.year) {
      return false;
    }

    // Month filter check
    if (filters.month !== 'ALL' && String(letter.month) !== filters.month) {
      return false;
    }

    return true;
  });
}
