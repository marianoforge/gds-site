import { google } from "googleapis";

type ContactRow = {
  nombre: string;
  apellido: string;
  email: string;
  whatsapp: string;
  mensaje: string;
};

function loadServiceAccountCredentials(): { clientEmail: string; privateKey: string } | null {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64?.trim();
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  let jsonStr: string | undefined;
  if (b64) {
    try {
      jsonStr = Buffer.from(b64, "base64").toString("utf8");
    } catch {
      return null;
    }
  } else if (raw) {
    jsonStr = raw;
  } else {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonStr) as { client_email?: string; private_key?: string };
    const clientEmail = typeof parsed.client_email === "string" ? parsed.client_email : "";
    const privateKey = typeof parsed.private_key === "string" ? parsed.private_key.replace(/\\n/g, "\n") : "";
    if (!clientEmail || !privateKey) {
      return null;
    }
    return { clientEmail, privateKey };
  } catch {
    return null;
  }
}

export async function appendContactRow(row: ContactRow): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const range = process.env.GOOGLE_SHEETS_RANGE?.trim() || "Sheet1!A:F";
  const creds = loadServiceAccountCredentials();

  if (!spreadsheetId || !creds) {
    return;
  }

  const auth = new google.auth.JWT({
    email: creds.clientEmail,
    key: creds.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const timestamp = new Date().toISOString();
  const values = [[timestamp, row.nombre, row.apellido, row.email, row.whatsapp, row.mensaje]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}
