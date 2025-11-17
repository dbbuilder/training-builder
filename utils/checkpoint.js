/**
 * Checkpoint System
 * =================
 * Saves progress to enable resuming failed generation runs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHECKPOINT_FILE = path.join(__dirname, '..', '.checkpoint.json');

/**
 * Save checkpoint after completing a chapter
 */
export async function saveCheckpoint(chapterNumber, totalChapters) {
  const checkpoint = {
    lastCompleted: chapterNumber,
    totalChapters,
    timestamp: new Date().toISOString(),
    canResume: chapterNumber < totalChapters
  };

  await fs.writeFile(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
  return checkpoint;
}

/**
 * Load checkpoint to resume from last completed chapter
 */
export async function loadCheckpoint() {
  try {
    const content = await fs.readFile(CHECKPOINT_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null; // No checkpoint exists
  }
}

/**
 * Clear checkpoint (after successful completion)
 */
export async function clearCheckpoint() {
  try {
    await fs.unlink(CHECKPOINT_FILE);
  } catch (error) {
    // File doesn't exist, that's fine
  }
}

/**
 * Get starting chapter number (resume or start from 1)
 */
export async function getStartingChapter(resume = false) {
  if (!resume) {
    return 1;
  }

  const checkpoint = await loadCheckpoint();
  if (!checkpoint || !checkpoint.canResume) {
    return 1;
  }

  return checkpoint.lastCompleted + 1;
}
