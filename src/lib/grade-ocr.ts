// src/lib/grade-ocr.ts
// Phase 2: Academic Intelligence — Parse handwritten/printed grades via Tesseract.js

import Tesseract from 'tesseract.js';

export interface ParsedGradeRow {
  studentName: string;
  subject: string;
  score: number | null;
  raw: string;
}

export interface OCRResult {
  rows: ParsedGradeRow[];
  rawText: string;
  confidence: number;
}

/**
 * Run OCR on an image file (grade sheet photo or scan).
 * Returns parsed rows extracted from the text.
 */
export async function parseGradeSheetImage(
  imageSource: File | string,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  const result = await Tesseract.recognize(imageSource, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const rawText = result.data.text;
  const confidence = result.data.confidence;
  const rows = extractGradeRows(rawText);

  return { rows, rawText, confidence };
}

/**
 * Heuristic parser: looks for lines containing a name + numeric score.
 * Format expected: "John Doe  Mathematics  87"
 */
function extractGradeRows(text: string): ParsedGradeRow[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const rows: ParsedGradeRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip header lines
    if (/^(name|student|subject|score|mark|total)/i.test(trimmed)) continue;

    // Match: anything + number at end
    const match = trimmed.match(/^(.+?)\s{2,}(.+?)\s{2,}(\d{1,3}(?:\.\d+)?)$/);
    if (match) {
      rows.push({
        studentName: match[1].trim(),
        subject: match[2].trim(),
        score: parseFloat(match[3]),
        raw: trimmed,
      });
    } else {
      // Try simpler: last token is a number
      const parts = trimmed.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      const score = parseFloat(lastPart);
      if (!isNaN(score) && score >= 0 && score <= 100) {
        rows.push({
          studentName: parts.slice(0, -1).join(' '),
          subject: '',
          score,
          raw: trimmed,
        });
      } else {
        rows.push({ studentName: '', subject: '', score: null, raw: trimmed });
      }
    }
  }

  return rows.filter((r) => r.score !== null);
}

/**
 * Convert a numeric score to a grade letter (Cameroon GCE scale).
 */
export function scoreToGradeLetter(score: number, maxScore = 100): string {
  const pct = (score / maxScore) * 100;
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  if (pct >= 40) return 'E';
  return 'F';
}

/**
 * Compute class demographic metrics from a set of grade entries.
 */
export function computeClassMetrics(scores: number[], maxScore = 100) {
  if (scores.length === 0) return null;
  const passing = scores.filter((s) => (s / maxScore) * 100 >= 50);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return {
    total: scores.length,
    average: Math.round(avg * 10) / 10,
    passRate: Math.round((passing.length / scores.length) * 100),
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
  };
}
