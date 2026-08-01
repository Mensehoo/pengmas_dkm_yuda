import { NextResponse } from 'next/server';

function getCleanPrivateKey(key?: string) {
  if (!key) return '';
  let cleaned = key.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, '\n');
}

/**
 * Server API handler for saving letter metadata & Google Sheets synchronization.
 */
export async function POST(request: Request) {
  try {
    const letter = await request.json();
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
    const privateKey = getCleanPrivateKey(process.env.GOOGLE_PRIVATE_KEY);
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();

    const hasGoogleServiceAccount = Boolean(serviceEmail && privateKey);

    let syncedToSheets = false;
    let sheetsError = '';

    if (hasGoogleServiceAccount && spreadsheetId) {
      try {
        const { google } = await import('googleapis');
        const auth = new google.auth.JWT(
          serviceEmail,
          undefined,
          privateKey,
          ['https://www.googleapis.com/auth/spreadsheets']
        );

        const sheets = google.sheets({ version: 'v4', auth });
        
        // Append row to the first sheet tab (range 'A:H')
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'A:H',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [
              [
                letter.number || '',
                letter.type || '',
                letter.date || '',
                letter.senderOrRecipient || '',
                letter.subject || '',
                letter.driveUrl || '',
                letter.signatory || letter.notes || '',
                new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
              ]
            ]
          }
        });

        syncedToSheets = true;
      } catch (err: any) {
        console.error('Google Sheets API append failed:', err);
        sheetsError = err?.message || String(err);
      }
    } else {
      if (!hasGoogleServiceAccount) {
        sheetsError = 'Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY';
      } else if (!spreadsheetId) {
        sheetsError = 'Missing GOOGLE_SHEETS_SPREADSHEET_ID';
      }
    }

    return NextResponse.json({
      success: true,
      message: syncedToSheets
        ? 'Data surat berhasil dicatat ke Google Sheets'
        : `Surat tersimpan di app (${sheetsError || 'Spreadsheet tidak diset'})`,
      data: letter,
      syncedToSheets,
      sheetsError: sheetsError || null,
    });
  } catch (error: any) {
    console.error('Error in letters API route:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memproses data surat' },
      { status: 500 }
    );
  }
}
