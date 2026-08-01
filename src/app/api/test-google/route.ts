import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getCleanPrivateKey(key?: string) {
  if (!key) return '';
  let cleaned = key.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, '\n');
}

function bufferToStream(buffer: Buffer) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Readable } = require('stream');
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
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
    googleDriveUploadTest: null,
    googleSheetsTest: null,
  };

  if (!serviceEmail || !privateKey) {
    results.status = 'ERROR';
    results.message = 'Environment variable GOOGLE_SERVICE_ACCOUNT_EMAIL atau GOOGLE_PRIVATE_KEY belum di-set.';
    return NextResponse.json(results, { status: 400 });
  }

  try {
    const { google } = await import('googleapis');

    const driveAuth = new google.auth.JWT(
      serviceEmail,
      undefined,
      privateKey,
      ['https://www.googleapis.com/auth/drive']
    );
    const drive = google.drive({ version: 'v3', auth: driveAuth });

    // Test 1: Folder metadata access
    if (driveFolderId) {
      try {
        const folderMeta = await drive.files.get({
          fileId: driveFolderId,
          fields: 'id, name',
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
          recommendation: `Pastikan folder Google Drive (${driveFolderId}) sudah dibagikan ke ${serviceEmail} dengan akses Editor.`,
        };
      }
    }

    // Test 2: Actual small file upload test
    try {
      const testContent = Buffer.from(`Test upload DKM - ${new Date().toISOString()}`);
      const testFileName = `_test_upload_${Date.now()}.txt`;

      const uploadRes = await drive.files.create({
        requestBody: {
          name: testFileName,
          parents: driveFolderId ? [driveFolderId] : undefined,
          mimeType: 'text/plain',
        },
        media: {
          mimeType: 'text/plain',
          body: bufferToStream(testContent),
        },
        fields: 'id, name, webViewLink',
      });

      if (uploadRes.data.id) {
        // Set public permission
        await drive.permissions.create({
          fileId: uploadRes.data.id,
          requestBody: { role: 'reader', type: 'anyone' },
        });

        results.googleDriveUploadTest = {
          success: true,
          message: `Upload file tes berhasil! File "${testFileName}" sudah ada di Google Drive.`,
          fileId: uploadRes.data.id,
          fileLink: `https://drive.google.com/file/d/${uploadRes.data.id}/view?usp=sharing`,
        };
      }
    } catch (uploadErr: any) {
      results.googleDriveUploadTest = {
        success: false,
        error: uploadErr?.message || String(uploadErr),
        recommendation: 'Upload file ke Drive gagal. Periksa error untuk detail lebih lanjut.',
      };
    }

    // Test 3: Google Sheets access
    if (spreadsheetId) {
      try {
        const sheetsAuth = new google.auth.JWT(
          serviceEmail,
          undefined,
          privateKey,
          ['https://www.googleapis.com/auth/spreadsheets']
        );
        const sheets = google.sheets({ version: 'v4', auth: sheetsAuth });
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
          recommendation: `Pastikan Spreadsheet (${spreadsheetId}) sudah dibagikan ke ${serviceEmail} dengan akses Editor.`,
        };
      }
    }
  } catch (authErr: any) {
    results.authError = authErr?.message || String(authErr);
  }

  return NextResponse.json(results);
}
