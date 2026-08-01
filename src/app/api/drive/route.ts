import { NextResponse } from 'next/server';

// Explicitly run in Node.js runtime for googleapis stream compatibility
export const runtime = 'nodejs';

function getCleanPrivateKey(key?: string) {
  if (!key) return '';
  let cleaned = key.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, '\n');
}

// Reliable buffer-to-readable-stream helper for googleapis in serverless
function bufferToStream(buffer: Buffer) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Readable } = require('stream');
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Server API handler for Google Drive PDF upload
 * Accepts FormData with file & metadata.
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

    let driveViewLink = '';
    let uploadError = '';
    let isRealUpload = false;

    if (hasGoogleServiceAccount) {
      try {
        const { google } = await import('googleapis');
        const auth = new google.auth.JWT(
          serviceEmail,
          undefined,
          privateKey,
          [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file'
          ]
        );

        const drive = google.drive({ version: 'v3', auth });

        // Convert File to Buffer, then to a proper Readable stream for googleapis
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const sanitizeName = `${letterNumber.replace(/[\/\\:*?"<>|]/g, '_')}_${type}.pdf`;

        let fileId: string | null = null;

        // 1) Try uploading to specific Drive folder
        if (driveFolderId) {
          try {
            const res = await drive.files.create({
              requestBody: {
                name: sanitizeName,
                parents: [driveFolderId],
                mimeType: 'application/pdf',
              },
              media: {
                mimeType: 'application/pdf',
                body: bufferToStream(fileBuffer),
              },
              fields: 'id',
            });
            fileId = res.data.id ?? null;
          } catch (folderErr: any) {
            console.error('Upload to folder failed, will retry without parent:', folderErr?.message);
          }
        }

        // 2) Fallback: upload to root Drive (no parent)
        if (!fileId) {
          const res = await drive.files.create({
            requestBody: {
              name: sanitizeName,
              mimeType: 'application/pdf',
            },
            media: {
              mimeType: 'application/pdf',
              body: bufferToStream(fileBuffer),
            },
            fields: 'id',
          });
          fileId = res.data.id ?? null;
        }

        if (fileId) {
          // 3) Set permission: anyone with link can view
          try {
            await drive.permissions.create({
              fileId,
              requestBody: { role: 'reader', type: 'anyone' },
            });
          } catch (permErr) {
            console.warn('Could not set public permission:', permErr);
          }

          driveViewLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
          isRealUpload = true;
        } else {
          uploadError = 'File ID tidak ditemukan setelah upload — files.create tidak mengembalikan ID.';
        }
      } catch (err: any) {
        console.error('Google Drive API upload failed:', err);
        uploadError = err?.message || String(err);
      }
    } else {
      uploadError = 'Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY environment variables';
    }

    // Fallback URL if upload failed
    if (!driveViewLink) {
      driveViewLink = `https://drive.google.com/file/d/simulated_${Date.now()}/view`;
    }

    return NextResponse.json({
      success: isRealUpload,
      message: isRealUpload
        ? 'File PDF berhasil di-upload ke Google Drive'
        : `Simulasi upload (Drive API error: ${uploadError})`,
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
