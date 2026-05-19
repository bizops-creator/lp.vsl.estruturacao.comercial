import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import AdmZip from "adm-zip";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API to handle lead submission to Kommo CRM
  app.post("/api/leads", async (req, res) => {
    const { name, email, phone, answers } = req.body;
    const subdomain = process.env.KOMMO_SUBDOMAIN;
    const token = process.env.KOMMO_API_TOKEN;

    if (!subdomain || !token) {
      console.warn("Kommo CRM credentials missing. Lead not sent to CRM.");
      // We still return success to the client so they can redirect to Calendly, 
      // but we log the issue.
      return res.json({ success: true, message: "Lead objective handled locally (CRM credentials missing)" });
    }

    try {
      // Kommo API V4 structure: https://www.kommo.com/developers/content/crm_platform/leads-api/
      // 1. Create a lead with contact info
      const response = await axios.post(
        `https://${subdomain}.kommo.com/api/v4/leads/complex`,
        [
          {
            name: `Lead: ${name}`,
            _embedded: {
              contacts: [
                {
                  first_name: name,
                  custom_fields_values: [
                    {
                      field_code: "EMAIL",
                      values: [{ value: email, enum_code: "WORK" }]
                    },
                    {
                      field_code: "PHONE",
                      values: [{ value: phone, enum_code: "WORK" }]
                    }
                  ]
                }
              ]
            },
            custom_fields_values: [
              {
                field_id: 0, // You would normally use a field ID for "Answers" or "Notes"
                values: [{ value: JSON.stringify(answers) }]
              }
            ]
          }
        ],
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      res.json({ success: true, data: response.data });
    } catch (error: any) {
      console.error("CRM Sync error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to sync with CRM" });
    }
  });

  // API to sync fonts from Google Drive
  app.post("/api/sync-fonts", async (req, res) => {
    const { fileId, accessToken, fileName: requestedFileName } = req.body;

    if (!fileId || !accessToken) {
      return res.status(400).json({ error: "File ID and Access Token are required" });
    }

    try {
      console.log(`Downloading file ${fileId} from Google Drive...`);
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download file: ${errorText}`);
      }

      const fontsDir = path.join(process.cwd(), "public", "fonts");
      if (!fs.existsSync(fontsDir)) {
        fs.mkdirSync(fontsDir, { recursive: true });
      }

      const contentType = response.headers.get("content-type") || "";
      const buffer = Buffer.from(await response.arrayBuffer());
      const extractedFiles: string[] = [];

      if (contentType.includes("zip") || (requestedFileName && requestedFileName.endsWith(".zip"))) {
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        zipEntries.forEach((entry) => {
          const entryName = entry.entryName.toLowerCase();
          let targetName = path.basename(entry.entryName);

          if (entryName.includes("publica") && (entryName.endsWith(".ttf") || entryName.endsWith(".otf") || entryName.endsWith(".woff2"))) {
            targetName = entryName.endsWith(".otf") ? "PublicaPlay.otf" : "PublicaPlay.ttf";
          } else if (entryName.includes("accidental") && (entryName.endsWith(".ttf") || entryName.endsWith(".otf") || entryName.endsWith(".woff2"))) {
            targetName = "AccidentalPresidency.ttf";
          }

          if (entryName.endsWith(".ttf") || entryName.endsWith(".otf") || entryName.endsWith(".woff2") || entryName.endsWith(".woff")) {
            const data = entry.getData();
            fs.writeFileSync(path.join(fontsDir, targetName), data);
            extractedFiles.push(targetName);
          }
        });
      } else {
        // Direct font file
        let targetName = requestedFileName || "font.ttf";
        const lowerName = targetName.toLowerCase();

        if (lowerName.includes("publica")) {
          targetName = lowerName.endsWith(".otf") ? "PublicaPlay.otf" : "PublicaPlay.ttf";
        } else if (lowerName.includes("accidental")) {
          targetName = "AccidentalPresidency.ttf";
        }

        fs.writeFileSync(path.join(fontsDir, targetName), buffer);
        extractedFiles.push(targetName);
      }

      res.json({ success: true, files: extractedFiles });
    } catch (error: any) {
      console.error("Sync error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
