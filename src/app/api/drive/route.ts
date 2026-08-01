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
 * Server API handler for Google Drive PDF upload
 * Accepts FormData with file & metadata.
 * Communicates with Google Drive API via googleapis package when GOOGLE_SERVICE_ACCOUNT credentials exist.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const letterNumber = (formData.get('letterNumber') as string) || 'SURAT-DKM';
    const type = (formData.get('type') as string) || 'KELUAR';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File PDF tidak ditemukan dalam payload request' },
        { status: 400 }
      );
    }

    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
    const privateKey = getCleanPrivateKey(process.env.GOOGLE_PRIVATE_KEY);
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

    const hasGoogleServiceAccount = Boolean(serviceEmail && privateKey);

    let driveViewLink = `https://drive.google.com/file/d/mock_${Date.now()}_${type.toLowerCase()}/view`;
    let uploadError = '';
    let isRealUpload = false;

    if (hasGoogleServiceAccount) {
      try {
        const { google } = await import('googleapis');
        const auth = new google.auth.JWT(
          serviceEmail,
          undefined,
          privateKey,
          ['https://www.googleapis.com/auth/drive']
        );

        const drive = google.drive({ version: 'v3', auth });
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileMetadata: any = {
          name: `${letterNumber.replace(/[\/\\:]/g, '_')}_${file.name}`,
        };

        if (driveFolderId) {
          fileMetadata.parents = [driveFolderId];
        }

        const response = await drive.files.create({
          requestBody: fileMetadata,
          media: {
            mimeType: file.type || 'application/pdf',
            body: buffer,
          },
          fields: 'id, webViewLink, webContentLink',
        });

        if (response.data.id) {
          // Make file viewable by anyone with link
          try {
            await drive.permissions.create({
              fileId: response.data.id,
              requestBody: {
                role: 'reader',
                type: 'anyone',
              },
            });
          } catch (permErr) {
            console.warn('Could not set public permission on Drive file:', permErr);
          }

          driveViewLink = response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;
          isRealUpload = true;
        }
      } catch (err: any) {
        console.error('Google Drive API upload failed:', err);
        uploadError = err?.message || String(err);
      }
    } else {
      uploadError = 'Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY environment variables in Vercel';
    }

    return NextResponse.json({
      success: isRealUpload,
      message: isRealUpload
        ? 'File PDF berhasil di-upload ke Google Drive'
        : `Simulasi upload (Drive API: ${uploadError || 'Service Account tidak aktif'})`,
      driveUrl: driveViewLink,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      isRealUpload,
      errorDetails: uploadError || null,
    });
  } catch (error: any) {
    console.error('Error in Google Drive API Route:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memproses upload PDF ke Google Drive' },
      { status: 500 }
    );
  }
}
