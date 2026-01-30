/**
 * Leaderboard utility for managing high scores in localStorage
 *
 * Stores player high scores including name, score, and date.
 * Maintains a list of the top 10 scores.
 */

const STORAGE_KEY = 'partydraw_highscores';
const MAX_SCORES = 10;

/**
 * High score entry stored in localStorage
 */
export interface HighScoreEntry {
  playerName: string;
  score: number;
  date: string; // ISO date string
}

/**
 * Get all high scores from localStorage
 */
export function getHighScores(): HighScoreEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const scores = JSON.parse(stored) as HighScoreEntry[];
    // Validate the data structure
    if (!Array.isArray(scores)) {
      return [];
    }
    return scores.filter(
      (entry) =>
        typeof entry.playerName === 'string' &&
        typeof entry.score === 'number' &&
        typeof entry.date === 'string'
    );
  } catch {
    // Invalid JSON or other error - return empty array
    return [];
  }
}

/**
 * Save a new high score to localStorage
 * Maintains top 10 scores sorted by score (highest first)
 *
 * @param playerName - The player's name
 * @param score - The player's final score
 * @returns true if the score made it into the top 10
 */
export function saveHighScore(playerName: string, score: number): boolean {
  const scores = getHighScores();

  const newEntry: HighScoreEntry = {
    playerName,
    score,
    date: new Date().toISOString(),
  };

  // Add new score and sort by score (highest first)
  scores.push(newEntry);
  scores.sort((a, b) => b.score - a.score);

  // Keep only top 10
  const topScores = scores.slice(0, MAX_SCORES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
  } catch {
    // localStorage might be full or disabled - fail silently
    return false;
  }

  // Return true if this score made it into the top 10
  return topScores.some(
    (entry) =>
      entry.playerName === playerName &&
      entry.score === score &&
      entry.date === newEntry.date
  );
}

/**
 * Save multiple scores from a game (e.g., all final standings)
 * Only saves scores that make it into the top 10
 *
 * @param standings - Array of player standings with name and score
 * @returns Number of scores that made it into the top 10
 */
export function saveGameScores(
  standings: Array<{ playerName: string; score: number }>
): number {
  let savedCount = 0;
  const now = new Date().toISOString();

  // Get current scores
  let scores = getHighScores();

  // Add all standings with the same timestamp
  for (const { playerName, score } of standings) {
    if (score > 0) {
      scores.push({
        playerName,
        score,
        date: now,
      });
    }
  }

  // Sort and keep top 10
  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, MAX_SCORES);

  // Count how many of the new scores made it
  savedCount = topScores.filter((entry) => entry.date === now).length;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
  } catch {
    return 0;
  }

  return savedCount;
}

/**
 * Check if a score would make it into the top 10
 *
 * @param score - Score to check
 * @returns true if this score would be in the top 10
 */
export function isHighScore(score: number): boolean {
  const scores = getHighScores();
  if (scores.length < MAX_SCORES) {
    return score > 0;
  }
  const lowestScore = scores[scores.length - 1].score;
  return score > lowestScore;
}

/**
 * Clear all high scores from localStorage
 */
export function clearHighScores(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Fail silently
  }
}

/**
 * Get the position a score would hold in the leaderboard
 *
 * @param score - Score to check
 * @returns Position (1-10) or null if not in top 10
 */
export function getScorePosition(score: number): number | null {
  const scores = getHighScores();
  const position = scores.filter((entry) => entry.score > score).length + 1;
  if (position > MAX_SCORES) {
    return null;
  }
  return position;
}

/**
 * Format a date for display
 *
 * @param isoDate - ISO date string
 * @returns Formatted date string (e.g., "Jan 30, 2026")
 */
export function formatScoreDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
