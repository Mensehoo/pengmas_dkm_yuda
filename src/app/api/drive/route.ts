import { NextResponse } from 'next/server';
import { Readable } from 'stream';

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
        
        // Convert File ArrayBuffer to Node Readable Stream (required by googleapis in serverless)
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const sanitizeName = `${letterNumber.replace(/[\/\\:]/g, '_')}_${file.name.replace(/[\/\\:]/g, '_')}`;

        let createResponse: any = null;

        // Try uploading into specific Drive folder first
        if (driveFolderId) {
          try {
            createResponse = await drive.files.create({
              requestBody: {
                name: sanitizeName,
                parents: [driveFolderId],
              },
              media: {
                mimeType: file.type || 'application/pdf',
                body: Readable.from(fileBuffer),
              },
              fields: 'id, webViewLink, webContentLink',
            });
          } catch (folderErr: any) {
            console.warn('Upload with folder parent failed, trying root upload:', folderErr?.message);
          }
        }

        // Fallback: upload without parent folder if folder upload failed or folder ID not specified
        if (!createResponse) {
          createResponse = await drive.files.create({
            requestBody: {
              name: sanitizeName,
            },
            media: {
              mimeType: file.type || 'application/pdf',
              body: Readable.from(fileBuffer),
            },
            fields: 'id, webViewLink, webContentLink',
          });
        }

        if (createResponse?.data?.id) {
          const fileId = createResponse.data.id;

          // Set permission so link is viewable by anyone
          try {
            await drive.permissions.create({
              fileId: fileId,
              requestBody: {
                role: 'reader',
                type: 'anyone',
              },
            });
          } catch (permErr) {
            console.warn('Could not set public permission on Drive file:', permErr);
          }

          driveViewLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
          isRealUpload = true;
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
