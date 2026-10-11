import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Server-side Gemini endpoint for receipt extraction (optional assistant)
// NEVER exposes API key to client; adheres to strict 8-second timeout rule
app.post('/api/gemini/extract-receipt', async (req, res) => {
  const { receiptText } = req.body;
  if (!receiptText || typeof receiptText !== 'string') {
    return res.status(400).json({ error: 'Receipt text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Gemini API key is not configured' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Enforce 8-second timeout as required by spec
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini extraction timed out after 8s')), 8000)
    );

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are a ration receipt parser assistant. Parse ONLY the following pasted receipt text. Do NOT assume, invent or detect fraud.
Receipt Text:
"""
${receiptText.slice(0, 2000)}
"""

Extract detected ration items. For each detected item return:
- itemKey: One of 'Grain', 'Rice', 'Wheat', 'Sugar', 'Dal', 'Oil' or the exact item name in text
- qtyKg: number in kg or litres (convert grams to kg decimal, e.g. 500g is 0.5)
- unit: 'kg' or 'litre'
- date: ISO date string 'YYYY-MM-DD' if found or can be reliably determined (if year missing, assume current year), or null if not clear
- amountRupees: number in rupees if found, or null
- receiptRef: receipt number / reference code string if found, or null
- place: 'home_shop', 'other_shop', or 'unknown'

Respond with STRICT JSON format:
{
  "items": [
    {
      "itemKey": string,
      "qtyKg": number,
      "unit": "kg" | "litre",
      "date": string | null,
      "amountRupees": number | null,
      "receiptRef": string | null,
      "place": "home_shop" | "other_shop" | "unknown"
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const response = (await Promise.race([callPromise, timeoutPromise])) as any;
    const rawText = response.text || '';
    const parsed = JSON.parse(rawText);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Gemini extraction error/timeout:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Extraction failed' });
  }
});

// Setup Vite dev server or static serve
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`RationSaathi server running on http://0.0.0.0:${port}`);
  });
}

startServer();
