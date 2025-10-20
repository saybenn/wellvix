// /pages/api/uploads/base64.js
// Dev-only base64 uploader. Writes files into /public/uploads and returns URLs.
// SECURITY: DO NOT ship this as-is to prod.
// TODO(Supabase): Replace with Supabase Storage upload + signed URL return.

import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } }, // bump if needed
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { files } = req.body || {};
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "files array required" });
    }

    const outDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(outDir, { recursive: true });

    const saved = [];
    for (const f of files) {
      const { filename, contentBase64 } = f || {};
      if (!filename || !contentBase64) continue;

      // Strip data URL prefix if present
      const base64 = String(contentBase64).replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const finalName = `${Date.now()}_${safe}`;
      const filePath = path.join(outDir, finalName);

      fs.writeFileSync(filePath, buffer);
      saved.push({
        url: `/uploads/${finalName}`,
        name: safe,
        size: buffer.length,
      });
    }

    return res.status(200).json({ files: saved });
  } catch (e) {
    console.error("upload error", e);
    return res.status(500).json({ error: "upload_failed" });
  }
}
