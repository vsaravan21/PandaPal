/**
 * Multer config for multipart file upload. Saves to temp folder.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const tmpDir = path.join(__dirname, '..', 'tmp', 'uploads');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    const safe = (file.originalname || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(file.originalname || '');
    if (allowed) cb(null, true);
    else cb(new Error('Only PDF and image files are allowed'));
  },
});

module.exports = { upload, tmpDir };
