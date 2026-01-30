/**
 * ScoringService
 * Handles score calculations for PartyDraw game.
 *
 * Scoring rules:
 * - 100 points per vote received
 * - Up to 50 points speed bonus (linear scale from 0-10 seconds)
 * - No speed bonus for auto-submitted drawings
 */

/**
 * Drawing submission metadata
 */
export interface DrawingSubmission {
  /** Player ID who submitted the drawing */
  playerId: string;
  /** Base64 image data */
  drawingData: string;
  /** Timestamp when the drawing was submitted */
  submittedAt: number;
  /** Whether this was auto-submitted when the timer expired */
  isAutoSubmitted: boolean;
}

/**
 * Score breakdown for a single player in a round
 */
export interface PlayerRoundScore {
  /** Player ID */
  playerId: string;
  /** Points earned from votes (100 per vote) */
  votePoints: number;
  /** Speed bonus points (0-50) */
  speedBonus: number;
  /** Total points earned this round */
  totalPoints: number;
  /** Number of votes received */
  votesReceived: number;
  /** Time taken to submit in milliseconds (null if auto-submitted) */
  submissionTimeMs: number | null;
}

/**
 * Constants for scoring calculations
 */
export const SCORING_CONSTANTS = {
  /** Points awarded per vote received */
  POINTS_PER_VOTE: 100,
  /** Maximum speed bonus points */
  MAX_SPEED_BONUS: 50,
  /** Time window for speed bonus in milliseconds (10 seconds) */
  SPEED_BONUS_WINDOW_MS: 10000,
} as const;

/**
 * ScoringService class
 * Calculates scores for game rounds
 */
export class ScoringService {
  /**
   * Calculates the speed bonus based on submission time
   * Linear scale: 50 points at 0 seconds, 0 points at 10+ seconds
   *
   * @param submissionTimeMs - Time taken to submit in milliseconds from phase start
   * @param isAutoSubmitted - Whether the drawing was auto-submitted
   * @returns Speed bonus points (0-50)
   */
  calculateSpeedBonus(submissionTimeMs: number, isAutoSubmitted: boolean): number {
    // No bonus for auto-submitted drawings
    if (isAutoSubmitted) {
      return 0;
    }

    // No bonus if submission time is 10 seconds or more
    if (submissionTimeMs >= SCORING_CONSTANTS.SPEED_BONUS_WINDOW_MS) {
      return 0;
    }

    // No bonus for invalid submission times
    if (submissionTimeMs < 0) {
      return 0;
    }

    // Linear scale: 50 points at 0ms, 0 points at 10000ms
    // Formula: bonus = MAX_BONUS * (1 - (time / WINDOW))
    const ratio = submissionTimeMs / SCORING_CONSTANTS.SPEED_BONUS_WINDOW_MS;
    const bonus = SCORING_CONSTANTS.MAX_SPEED_BONUS * (1 - ratio);

    // Round to nearest integer
    return Math.round(bonus);
  }

  /**
   * Calculates vote points based on number of votes received
   *
   * @param votesReceived - Number of votes the player received
   * @returns Points earned from votes
   */
  calculateVotePoints(votesReceived: number): number {
    return votesReceived * SCORING_CONSTANTS.POINTS_PER_VOTE;
  }

  /**
   * Counts votes for each player from the votes map
   *
   * @param votes - Map of voter ID to voted-for player ID
   * @returns Map of player ID to vote count
   */
  countVotes(votes: Map<string, string>): Map<string, number> {
    const counts = new Map<string, number>();

    for (const votedForId of votes.values()) {
      counts.set(votedForId, (counts.get(votedForId) || 0) + 1);
    }

    return counts;
  }

  /**
   * Calculates complete round scores for all players
   *
   * @param submissions - Array of drawing submissions with metadata
   * @param votes - Map of voter ID to voted-for player ID
   * @param phaseStartTime - Timestamp when the drawing phase started
   * @returns Array of player round scores
   */
  calculateRoundScores(
    submissions: DrawingSubmission[],
    votes: Map<string, string>,
    phaseStartTime: number
  ): PlayerRoundScore[] {
    // Count votes for each player
    const voteCounts = this.countVotes(votes);

    // Calculate scores for each player who submitted
    const scores: PlayerRoundScore[] = submissions.map((submission) => {
      const votesReceived = voteCounts.get(submission.playerId) || 0;
      const votePoints = this.calculateVotePoints(votesReceived);

      // Calculate submission time from phase start
      const submissionTimeMs = submission.submittedAt - phaseStartTime;
      const speedBonus = this.calculateSpeedBonus(submissionTimeMs, submission.isAutoSubmitted);

      const totalPoints = votePoints + speedBonus;

      return {
        playerId: submission.playerId,
        votePoints,
        speedBonus,
        totalPoints,
        votesReceived,
        submissionTimeMs: submission.isAutoSubmitted ? null : submissionTimeMs,
      };
    });

    // Sort by total points descending
    return scores.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  /**
   * Calculates a single player's score for a round
   *
   * @param submission - The player's drawing submission
   * @param votesReceived - Number of votes the player received
   * @param phaseStartTime - Timestamp when the drawing phase started
   * @returns Player round score
   */
  calculatePlayerScore(
    submission: DrawingSubmission,
    votesReceived: number,
    phaseStartTime: number
  ): PlayerRoundScore {
    const votePoints = this.calculateVotePoints(votesReceived);
    const submissionTimeMs = submission.submittedAt - phaseStartTime;
    const speedBonus = this.calculateSpeedBonus(submissionTimeMs, submission.isAutoSubmitted);
    const totalPoints = votePoints + speedBonus;

    return {
      playerId: submission.playerId,
      votePoints,
      speedBonus,
      totalPoints,
      votesReceived,
      submissionTimeMs: submission.isAutoSubmitted ? null : submissionTimeMs,
    };
  }

  /**
   * Finds the winner(s) of the round (players with highest score)
   *
   * @param scores - Array of player round scores
   * @returns Array of winning player scores (may be multiple in case of tie)
   */
  findRoundWinners(scores: PlayerRoundScore[]): PlayerRoundScore[] {
    if (scores.length === 0) {
      return [];
    }

    // Scores should already be sorted, but ensure we get the max
    const maxPoints = Math.max(...scores.map((s) => s.totalPoints));
    return scores.filter((s) => s.totalPoints === maxPoints);
  }

  /**
   * Calculates cumulative scores from multiple rounds
   *
   * @param roundScores - Array of arrays of player round scores
   * @returns Map of player ID to total cumulative score
   */
  calculateCumulativeScores(roundScores: PlayerRoundScore[][]): Map<string, number> {
    const cumulativeScores = new Map<string, number>();

    for (const roundScore of roundScores) {
      for (const playerScore of roundScore) {
        const currentTotal = cumulativeScores.get(playerScore.playerId) || 0;
        cumulativeScores.set(playerScore.playerId, currentTotal + playerScore.totalPoints);
      }
    }

    return cumulativeScores;
  }

  /**
   * Creates a DrawingSubmission object for a manual submission
   *
   * @param playerId - The player ID
   * @param drawingData - The base64 image data
   * @param submittedAt - Timestamp of submission (defaults to now)
   * @returns DrawingSubmission object
   */
  createManualSubmission(
    playerId: string,
    drawingData: string,
    submittedAt: number = Date.now()
  ): DrawingSubmission {
    return {
      playerId,
      drawingData,
      submittedAt,
      isAutoSubmitted: false,
    };
  }

  /**
   * Creates a DrawingSubmission object for an auto-submitted drawing
   *
   * @param playerId - The player ID
   * @param drawingData - The base64 image data (may be empty for blank drawings)
   * @param submittedAt - Timestamp of submission (defaults to now)
   * @returns DrawingSubmission object with isAutoSubmitted = true
   */
  createAutoSubmission(
    playerId: string,
    drawingData: string,
    submittedAt: number = Date.now()
  ): DrawingSubmission {
    return {
      playerId,
      drawingData,
      submittedAt,
      isAutoSubmitted: true,
    };
  }
}

// Export a singleton instance
export const scoringService = new ScoringService();
