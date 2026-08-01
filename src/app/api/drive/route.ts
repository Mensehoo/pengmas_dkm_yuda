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

/**
 * Google Drive PDF upload using OAuth2 (for personal Google Drive / Gmail accounts).
 * Service Accounts cannot upload to personal Drive (no storage quota).
 * OAuth2 with refresh token uploads as the actual Google user — files count toward their quota.
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

    const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
    const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
    const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

    const hasOAuth = Boolean(oauthClientId && oauthClientSecret && oauthRefreshToken);

    let driveViewLink = '';
    let uploadError = '';
    let isRealUpload = false;

    if (hasOAuth) {
      try {
        const { google } = await import('googleapis');

        // OAuth2 — uploads as the real Google user (personal Drive quota)
        const auth = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
        auth.setCredentials({ refresh_token: oauthRefreshToken });

        const drive = google.drive({ version: 'v3', auth });

        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const sanitizeName = `${letterNumber.replace(/[\/\\:*?"<>|]/g, '_')}_${type}.pdf`;

        let fileId: string | null = null;

        // Try uploading into specific Drive folder
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
            console.error('Upload to folder failed, retrying without parent:', folderErr?.message);
          }
        }

        // Fallback: upload without parent folder
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
          // Set public view permission (anyone with link)
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
          uploadError = 'Drive files.create tidak mengembalikan file ID.';
        }
      } catch (err: any) {
        console.error('Google Drive OAuth2 upload failed:', err);
        uploadError = err?.message || String(err);
      }
    } else {
      uploadError =
        'OAuth2 credentials belum diisi. Tambahkan GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN di Vercel Environment Variables.';
      console.warn(uploadError);
    }

    if (!driveViewLink) {
      driveViewLink = `https://drive.google.com/file/d/simulated_${Date.now()}/view`;
    }

    return NextResponse.json({
      success: isRealUpload,
      message: isRealUpload
        ? 'File PDF berhasil di-upload ke Google Drive'
        : `Simulasi upload — ${uploadError}`,
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
