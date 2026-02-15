/**
 * PandaPal document parsing API.
 * POST /api/upload -> extract text, parse with Claude, return parsed_plan + conflicts.
 * POST /api/confirm-care-plan -> receive caregiver review state (stub or persist).
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { upload, tmpDir } = require('./upload');
const { extractText, getMimeCategory } = require('./ocr');
const { parseWithClaude } = require('./claudeParser');
const { mergeCarePlans } = require('./merge');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '2mb' }));

// CORS for mobile app
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

async function handleUpload(req, res) {
  const files = req.files || [];
  const pastedText = (req.body && req.body.pasted_text) ? String(req.body.pasted_text) : '';
  if (files.length === 0 && !pastedText.trim()) {
    return res.status(400).json({ error: 'No files or pasted text provided' });
  }

  const uploadedPaths = (files || []).map((f) => path.join(tmpDir, f.filename));
  let allText = pastedText.trim() ? pastedText.trim() : '';
  const parsedPlans = [];

  const skippedFiles = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const filePath = uploadedPaths[i];
      const category = getMimeCategory(filePath);
      if (category !== 'pdf' && category !== 'image') {
        parsedPlans.push({ diagnosis: [], medications: [], emergency_rules: [], daily_care_tasks: [], restrictions: [], followups: [] });
        continue;
      }
      try {
        const text = await extractText(filePath);
        allText += (allText ? '\n\n' : '') + text;
        if (text.trim()) {
          const plan = await parseWithClaude(text);
          parsedPlans.push(plan);
        } else {
          parsedPlans.push({ diagnosis: [], medications: [], emergency_rules: [], daily_care_tasks: [], restrictions: [], followups: [] });
        }
      } catch (fileErr) {
        console.warn(`Skipping file ${files[i].originalname || filePath}:`, fileErr.message);
        skippedFiles.push({ name: files[i].originalname || path.basename(filePath), reason: fileErr.message });
        parsedPlans.push({ diagnosis: [], medications: [], emergency_rules: [], daily_care_tasks: [], restrictions: [], followups: [] });
      }
    }

    if (pastedText.trim()) {
      const plan = await parseWithClaude(pastedText.trim());
      parsedPlans.push(plan);
    }

    const { care_plan, conflicts } = mergeCarePlans(parsedPlans);

    const extracted_text_preview = allText.trim().slice(0, 400);

    res.json({
        parsed_plan: care_plan,
        conflicts,
        extracted_text_preview,
        skipped_files: skippedFiles,
      });
  } catch (err) {
    console.error('Upload/parse error:', err);
    res.status(500).json({
      error: 'Parsing failed',
      message: err.message || 'Server error',
    });
  } finally {
    for (const p of uploadedPaths) {
      try {
        await fs.unlink(p);
      } catch (_) {}
    }
  }
}

app.post(
  '/api/upload',
  (req, res, next) => {
    const isMultipart = (req.headers['content-type'] || '').includes('multipart/form-data');
    if (isMultipart) {
      upload.array('files', 10)(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
      });
    } else {
      next();
    }
  },
  handleUpload
);

/**
 * POST /api/confirm-care-plan
 * Body: { care_plan: reviewState } (caregiver-edited care plan).
 */
app.post('/api/confirm-care-plan', (req, res) => {
  const body = req.body || {};
  const care_plan = body.care_plan ?? body.reviewState ?? body;
  if (!care_plan || typeof care_plan !== 'object') {
    return res.status(400).json({ error: 'Missing care_plan in body' });
  }
  // Stub: just echo success. Later persist to DB.
  res.json({ success: true, care_plan });
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`PandaPal server listening on port ${PORT}`);
});
