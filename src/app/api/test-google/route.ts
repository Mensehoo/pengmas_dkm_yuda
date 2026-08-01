import { NextResponse } from 'next/server';

function getCleanPrivateKey(key?: string) {
  if (!key) return '';
  let cleaned = key.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, '\n');
}

export async function GET() {
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() || '';
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const privateKey = getCleanPrivateKey(rawKey);
  const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || '';
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || '';

  const results: any = {
    env: {
      hasServiceAccountEmail: Boolean(serviceEmail),
      serviceEmail: serviceEmail ? `${serviceEmail.slice(0, 5)}***@${serviceEmail.split('@')[1] || ''}` : 'BELUM DI-SET',
      hasPrivateKey: Boolean(rawKey),
      privateKeyLength: rawKey.length,
      privateKeyContainsBeginHeader: rawKey.includes('-----BEGIN PRIVATE KEY-----'),
      hasDriveFolderId: Boolean(driveFolderId),
      driveFolderId: driveFolderId || 'BELUM DI-SET',
      hasSpreadsheetId: Boolean(spreadsheetId),
      spreadsheetId: spreadsheetId || 'BELUM DI-SET',
    },
    googleDriveTest: null,
    googleSheetsTest: null,
  };

  if (!serviceEmail || !privateKey) {
    results.status = 'ERROR';
    results.message = 'Environment variable GOOGLE_SERVICE_ACCOUNT_EMAIL atau GOOGLE_PRIVATE_KEY belum di-set di Vercel.';
    return NextResponse.json(results, { status: 400 });
  }

  // Test Google Drive Access
  try {
    const { google } = await import('googleapis');
    const auth = new google.auth.JWT(
      serviceEmail,
      undefined,
      privateKey,
      ['https://www.googleapis.com/auth/drive']
    );

    const drive = google.drive({ version: 'v3', auth });

    if (driveFolderId) {
      try {
        const folderMeta = await drive.files.get({
          fileId: driveFolderId,
          fields: 'id, name, permissions',
        });
        results.googleDriveTest = {
          success: true,
          message: `Folder Drive "${folderMeta.data.name}" ditemukan & diizinkan.`,
          folderName: folderMeta.data.name,
        };
      } catch (fErr: any) {
        results.googleDriveTest = {
          success: false,
          error: fErr?.message || String(fErr),
          recommendation: `Pastikan folder Google Drive (${driveFolderId}) sudah dibagikan (Share) ke ${serviceEmail} dengan akses Editor.`,
        };
      }
    } else {
      results.googleDriveTest = {
        success: false,
        error: 'GOOGLE_DRIVE_FOLDER_ID belum diisi.',
      };
    }
  } catch (dAuthErr: any) {
    results.googleDriveTest = {
      success: false,
      error: `Auth error: ${dAuthErr?.message || String(dAuthErr)}`,
      recommendation: 'Format GOOGLE_PRIVATE_KEY mungkin salah. Pastikan menyalin seluruh teks dari JSON termasuk BEGIN/END PRIVATE KEY.',
    };
  }

  // Test Google Sheets Access
  if (spreadsheetId) {
    try {
      const { google } = await import('googleapis');
      const auth = new google.auth.JWT(
        serviceEmail,
        undefined,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      const sheets = google.sheets({ version: 'v4', auth });
      const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });

      results.googleSheetsTest = {
        success: true,
        message: `Spreadsheet "${sheetMeta.data.properties?.title}" terhubung.`,
        sheetTitle: sheetMeta.data.properties?.title,
      };
    } catch (sErr: any) {
      results.googleSheetsTest = {
        success: false,
        error: sErr?.message || String(sErr),
        recommendation: `Pastikan Google Sheets (${spreadsheetId}) sudah dibagikan ke ${serviceEmail} dengan akses Editor.`,
      };
    }
  }

  return NextResponse.json(results);
}
