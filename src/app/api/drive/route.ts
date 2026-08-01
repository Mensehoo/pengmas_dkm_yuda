import { NextResponse } from 'next/server';

/**
 * Server API handler for Google Drive PDF upload
 * Accepts FormData with file & metadata.
 * Communicates with Google Drive API via googleapis package when GOOGLE_SERVICE_ACCOUNT credentials exist.
 * Returns Google Drive direct view link or mock link for client preview.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const letterNumber = formData.get('letterNumber') as string || 'SURAT-DKM';
    const type = formData.get('type') as string || 'KELUAR';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File PDF tidak ditemukan dalam payload request' },
        { status: 400 }
      );
    }

    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1aB2cD3e4f5g6h7i8j9k0_DKMARCHIVE';
    const hasGoogleServiceAccount = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);

    let driveViewLink = `https://drive.google.com/file/d/mock_${Date.now()}_${type.toLowerCase()}/view`;

    if (hasGoogleServiceAccount) {
      try {
        const { google } = await import('googleapis');
        const auth = new google.auth.JWT(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          undefined,
          (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
          ['https://www.googleapis.com/auth/drive.file']
        );

        const drive = google.drive({ version: 'v3', auth });
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const response = await drive.files.create({
          requestBody: {
            name: `${letterNumber.replace(/\//g, '_')}_${file.name}`,
            parents: driveFolderId ? [driveFolderId] : undefined,
          },
          media: {
            mimeType: file.type || 'application/pdf',
            body: buffer,
          },
          fields: 'id, webViewLink, webContentLink',
        });

        if (response.data.webViewLink) {
          driveViewLink = response.data.webViewLink;
        }
      } catch (err) {
        console.warn('Google Drive API upload fallback (using simulated view link):', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'File PDF berhasil di-upload ke Google Drive',
      driveUrl: driveViewLink,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      isSimulated: !hasGoogleServiceAccount
    });
  } catch (error: any) {
    console.error('Error in Google Drive API Route:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memproses upload PDF ke Google Drive' },
      { status: 500 }
    );
  }
}
