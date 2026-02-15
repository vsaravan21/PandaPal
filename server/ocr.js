/**
 * Extract text from PDFs and images.
 * PDF: pdf-parse. Image: tesseract.js OCR.
 */

const fs = require('fs').promises;
const path = require('path');

let pdfParse;
let Tesseract;

async function loadPdfParse() {
  if (!pdfParse) pdfParse = require('pdf-parse');
  return pdfParse;
}

async function loadTesseract() {
  if (!Tesseract) Tesseract = require('tesseract.js');
  return Tesseract;
}

/**
 * Extract text from a PDF file.
 * @param {string} filePath - Absolute path to PDF
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPdf(filePath) {
  const pdfParse = await loadPdfParse();
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text || '';
}

/**
 * Extract text from an image using OCR.
 * @param {string} filePath - Absolute path to image (jpg, png, etc.)
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(filePath) {
  const Tesseract = await loadTesseract();
  const { data } = await Tesseract.recognize(filePath, 'eng', {
    logger: () => {},
  });
  return data?.text || '';
}

/**
 * Detect mime type from file path/extension.
 * @param {string} filePath
 * @returns {'pdf'|'image'|'unknown'}
 */
function getMimeCategory(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return 'pdf';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'].includes(ext))
    return 'image';
  return 'unknown';
}

/**
 * Extract text from a file based on its type.
 * @param {string} filePath - Absolute path
 * @returns {Promise<string>}
 */
async function extractText(filePath) {
  const category = getMimeCategory(filePath);
  if (category === 'pdf') return extractTextFromPdf(filePath);
  if (category === 'image') return extractTextFromImage(filePath);
  throw new Error(`Unsupported file type: ${path.extname(filePath)}`);
}

module.exports = {
  extractTextFromPdf,
  extractTextFromImage,
  extractText,
  getMimeCategory,
};
