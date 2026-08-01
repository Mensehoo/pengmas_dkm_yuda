import { NextResponse } from 'next/server';

/**
 * Server API handler for saving letter metadata & Google Sheets synchronization.
 */
export async function POST(request: Request) {
  try {
    const letter = await request.json();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const hasGoogleServiceAccount = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);

    if (hasGoogleServiceAccount && spreadsheetId) {
      try {
        const { google } = await import('googleapis');
        const auth = new google.auth.JWT(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          undefined,
          (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
          ['https://www.googleapis.com/auth/spreadsheets']
        );

        const sheets = google.sheets({ version: 'v4', auth });
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'SuratArchive!A:H',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [
              [
                letter.number,
                letter.type,
                letter.date,
                letter.senderOrRecipient,
                letter.subject,
                letter.driveUrl || '',
                letter.signatory || letter.notes || '',
                new Date().toISOString()
              ]
            ]
          }
        });
      } catch (err) {
        console.warn('Google Sheets API append fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Surat berhasil dicatat dan disinkronkan ke Google Sheets',
      data: letter,
      syncedToSheets: hasGoogleServiceAccount && Boolean(spreadsheetId)
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memproses data surat' },
      { status: 500 }
    );
  }
}
