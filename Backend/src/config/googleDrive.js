import dotenv from "dotenv";
dotenv.config();  // ✅ Added

import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.JWT(
  process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  SCOPES
);

const drive = google.drive({ version: "v3", auth });

export const uploadToDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    const fileMetadata = {
      name:    `${Date.now()}_${fileName}`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return response.data.webViewLink;
  } catch (error) {
    console.error("Google Drive Upload Error:", error);
    throw new Error("Google Drive upload failed");
  }
};