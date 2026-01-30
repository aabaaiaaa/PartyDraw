import { describe, it, expect, beforeEach } from 'vitest';
import {
  ScoringService,
  SCORING_CONSTANTS,
  DrawingSubmission,
  PlayerRoundScore,
} from '../services/ScoringService';

describe('ScoringService', () => {
  let scoringService: ScoringService;

  beforeEach(() => {
    scoringService = new ScoringService();
  });

  describe('calculateVotePoints', () => {
    it('should give 100 points per vote received', () => {
      expect(scoringService.calculateVotePoints(1)).toBe(100);
      expect(scoringService.calculateVotePoints(2)).toBe(200);
      expect(scoringService.calculateVotePoints(3)).toBe(300);
      expect(scoringService.calculateVotePoints(5)).toBe(500);
    });

    it('should return 0 points for no votes', () => {
      expect(scoringService.calculateVotePoints(0)).toBe(0);
    });

    it('should use POINTS_PER_VOTE constant correctly', () => {
      const votes = 4;
      expect(scoringService.calculateVotePoints(votes)).toBe(
        votes * SCORING_CONSTANTS.POINTS_PER_VOTE
      );
    });
  });

  describe('calculateSpeedBonus', () => {
    it('should give 50 points at 0 seconds (instant submission)', () => {
      const bonus = scoringService.calculateSpeedBonus(0, false);
      expect(bonus).toBe(50);
    });

    it('should give 0 points at 10 seconds', () => {
      const bonus = scoringService.calculateSpeedBonus(10000, false);
      expect(bonus).toBe(0);
    });

    it('should give 0 points for time beyond 10 seconds', () => {
      expect(scoringService.calculateSpeedBonus(11000, false)).toBe(0);
      expect(scoringService.calculateSpeedBonus(15000, false)).toBe(0);
      expect(scoringService.calculateSpeedBonus(20000, false)).toBe(0);
    });

    it('should scale linearly between 0 and 10 seconds', () => {
      // At 5 seconds (halfway), should be 25 points
      expect(scoringService.calculateSpeedBonus(5000, false)).toBe(25);

      // At 2 seconds, should be 40 points (50 * (1 - 0.2))
      expect(scoringService.calculateSpeedBonus(2000, false)).toBe(40);

      // At 8 seconds, should be 10 points (50 * (1 - 0.8))
      expect(scoringService.calculateSpeedBonus(8000, false)).toBe(10);
    });

    it('should return 0 points for auto-submitted drawings', () => {
      expect(scoringService.calculateSpeedBonus(0, true)).toBe(0);
      expect(scoringService.calculateSpeedBonus(1000, true)).toBe(0);
      expect(scoringService.calculateSpeedBonus(5000, true)).toBe(0);
    });

    it('should return 0 points for negative submission times', () => {
      expect(scoringService.calculateSpeedBonus(-1000, false)).toBe(0);
      expect(scoringService.calculateSpeedBonus(-100, false)).toBe(0);
    });

    it('should round to nearest integer', () => {
      // At 3333ms: 50 * (1 - 0.3333) = 50 * 0.6667 = 33.335 -> 33
      expect(scoringService.calculateSpeedBonus(3333, false)).toBe(33);

      // At 6666ms: 50 * (1 - 0.6666) = 50 * 0.3334 = 16.67 -> 17
      expect(scoringService.calculateSpeedBonus(6666, false)).toBe(17);
    });

    it('should use SCORING_CONSTANTS correctly', () => {
      expect(SCORING_CONSTANTS.MAX_SPEED_BONUS).toBe(50);
      expect(SCORING_CONSTANTS.SPEED_BONUS_WINDOW_MS).toBe(10000);
    });
  });

  describe('countVotes', () => {
    it('should count votes correctly for multiple players', () => {
      const votes = new Map<string, string>();
      votes.set('voter1', 'player1');
      votes.set('voter2', 'player1');
      votes.set('voter3', 'player2');
      votes.set('voter4', 'player1');

      const counts = scoringService.countVotes(votes);

      expect(counts.get('player1')).toBe(3);
      expect(counts.get('player2')).toBe(1);
    });

    it('should return empty map for no votes', () => {
      const votes = new Map<string, string>();
      const counts = scoringService.countVotes(votes);

      expect(counts.size).toBe(0);
    });

    it('should handle all votes to one player', () => {
      const votes = new Map<string, string>();
      votes.set('voter1', 'player1');
      votes.set('voter2', 'player1');
      votes.set('voter3', 'player1');
      votes.set('voter4', 'player1');

      const counts = scoringService.countVotes(votes);

      expect(counts.get('player1')).toBe(4);
      expect(counts.size).toBe(1);
    });

    it('should handle votes evenly distributed', () => {
      const votes = new Map<string, string>();
      votes.set('voter1', 'player1');
      votes.set('voter2', 'player2');
      votes.set('voter3', 'player3');

      const counts = scoringService.countVotes(votes);

      expect(counts.get('player1')).toBe(1);
      expect(counts.get('player2')).toBe(1);
      expect(counts.get('player3')).toBe(1);
    });
  });

  describe('calculateRoundScores', () => {
    const phaseStartTime = 1000;

    it('should calculate scores correctly with votes and speed bonus', () => {
      const submissions: DrawingSubmission[] = [
        {
          playerId: 'player1',
          drawingData: 'data1',
          submittedAt: 3000, // 2 seconds after start
          isAutoSubmitted: false,
        },
        {
          playerId: 'player2',
          drawingData: 'data2',
          submittedAt: 6000, // 5 seconds after start
          isAutoSubmitted: false,
        },
      ];

      const votes = new Map<string, string>();
      votes.set('voter1', 'player1');
      votes.set('voter2', 'player1');

      const scores = scoringService.calculateRoundScores(submissions, votes, phaseStartTime);

      // Player1: 2 votes (200pts) + speed bonus at 2s (40pts) = 240pts
      expect(scores[0].playerId).toBe('player1');
      expect(scores[0].votePoints).toBe(200);
      expect(scores[0].speedBonus).toBe(40);
      expect(scores[0].totalPoints).toBe(240);
      expect(scores[0].votesReceived).toBe(2);
      expect(scores[0].submissionTimeMs).toBe(2000);

      // Player2: 0 votes (0pts) + speed bonus at 5s (25pts) = 25pts
      expect(scores[1].playerId).toBe('player2');
      expect(scores[1].votePoints).toBe(0);
      expect(scores[1].speedBonus).toBe(25);
      expect(scores[1].totalPoints).toBe(25);
      expect(scores[1].votesReceived).toBe(0);
      expect(scores[1].submissionTimeMs).toBe(5000);
    });

    it('should return scores sorted by total points descending', () => {
      const submissions: DrawingSubmission[] = [
        {
          playerId: 'player1',
          drawingData: 'data1',
          submittedAt: 11000, // No speed bonus
          isAutoSubmitted: false,
        },
        {
          playerId: 'player2',
          drawingData: 'data2',
          submittedAt: 1000, // 0 seconds, max speed bonus
          isAutoSubmitted: false,
        },
        {
          playerId: 'player3',
          drawingData: 'data3',
          submittedAt: 6000, // 5 seconds
          isAutoSubmitted: false,
        },
      ];

      const votes = new Map<string, string>();
      // Player1 gets 2 votes = 200pts + 0 speed = 200
      votes.set('voter1', 'player1');
      votes.set('voter2', 'player1');
      // Player2 gets 1 vote = 100pts + 50 speed = 150
      votes.set('voter3', 'player2');
      // Player3 gets 0 votes = 0pts + 25 speed = 25

      const scores = scoringService.calculateRoundScores(submissions, votes, phaseStartTime);

      expect(scores[0].playerId).toBe('player1');
      expect(scores[0].totalPoints).toBe(200);
      expect(scores[1].playerId).toBe('player2');
      expect(scores[1].totalPoints).toBe(150);
      expect(scores[2].playerId).toBe('player3');
      expect(scores[2].totalPoints).toBe(25);
    });

    it('should handle no votes scenario', () => {
      const submissions: DrawingSubmission[] = [
        {
          playerId: 'player1',
          drawingData: 'data1',
          submittedAt: 1000, // 0 seconds
          isAutoSubmitted: false,
        },
        {
          playerId: 'player2',
          drawingData: 'data2',
          submittedAt: 6000, // 5 seconds
          isAutoSubmitted: false,
        },
      ];

      const votes = new Map<string, string>();

      const scores = scoringService.calculateRoundScores(submissions, votes, phaseStartTime);

      // Both players get 0 vote points, only speed bonus
      expect(scores[0].playerId).toBe('player1');
      expect(scores[0].votePoints).toBe(0);
      expect(scores[0].speedBonus).toBe(50);
      expect(scores[0].totalPoints).toBe(50);

      expect(scores[1].playerId).toBe('player2');
      expect(scores[1].votePoints).toBe(0);
      expect(scores[1].speedBonus).toBe(25);
      expect(scores[1].totalPoints).toBe(25);
    });

    it('should handle auto-submitted drawings with no speed bonus', () => {
      const submissions: DrawingSubmission[] = [
        {
          playerId: 'player1',
          drawingData: 'data1',
          submittedAt: 1000, // Would be instant
          isAutoSubmitted: true, // But auto-submitted
        },
        {
          playerId: 'player2',
          drawingData: 'data2',
          submittedAt: 3000, // 2 seconds
          isAutoSubmitted: false,
        },
      ];

      const votes = new Map<string, string>();
      votes.set('voter1', 'player1');
      votes.set('voter2', 'player2');

      const scores = scoringService.calculateRoundScores(submissions, votes, phaseStartTime);

      // Player1: auto-submitted, no speed bonus
      const player1Score = scores.find((s) => s.playerId === 'player1')!;
      expect(player1Score.votePoints).toBe(100);
      expect(player1Score.speedBonus).toBe(0);
      expect(player1Score.totalPoints).toBe(100);
      expect(player1Score.submissionTimeMs).toBeNull();

      // Player2: manual submission, gets speed bonus
      const player2Score = scores.find((s) => s.playerId === 'player2')!;
      expect(player2Score.votePoints).toBe(100);
      expect(player2Score.speedBonus).toBe(40);
      expect(player2Score.totalPoints).toBe(140);
      expect(player2Score.submissionTimeMs).toBe(2000);
    });

    it('should handle all votes going to one player', () => {
      const submissions: DrawingSubmission[] = [
        {
          playerId: 'player1',
          drawingData: 'data1',
          submittedAt: 6000,
          isAutoSubmitted: false,
        },
        {
          playerId: 'player2',
          drawingData: 'data2',
          submittedAt: 6000,
          isAutoSubmitted: false,
        },
        {
          playerId: 'player3',
          drawingData: 'data3',
          submittedAt: 6000,
          isAutoSubmitted: false,
        },
      ];

      const votes = new Map<string, string>();
      votes.set('voter1', 'player1');
      votes.set('voter2', 'player1');
      votes.set('voter3', 'player1');
      votes.set('voter4', 'player1');

      const scores = scoringService.calculateRoundScores(submissions, votes, phaseStartTime);

      // Player1: 4 votes (400pts) + speed bonus at 5s (25pts) = 425pts
      expect(scores[0].playerId).toBe('player1');
      expect(scores[0].votePoints).toBe(400);
      expect(scores[0].votesReceived).toBe(4);
      expect(scores[0].totalPoints).toBe(425);

      // Player2 and Player3: 0 votes + 25pts speed = 25pts each
      expect(scores[1].votePoints).toBe(0);
      expect(scores[1].totalPoints).toBe(25);
      expect(scores[2].votePoints).toBe(0);
      expect(scores[2].totalPoints).toBe(25);
    });

    it('should handle empty submissions array', () => {
      const submissions: DrawingSubmission[] = [];
      const votes = new Map<string, string>();

      const scores = scoringService.calculateRoundScores(submissions, votes, phaseStartTime);

      expect(scores.length).toBe(0);
    });
  });

  describe('calculatePlayerScore', () => {
    const phaseStartTime = 1000;

    it('should calculate individual player score correctly', () => {
      const submission: DrawingSubmission = {
        playerId: 'player1',
        drawingData: 'data1',
        submittedAt: 3000, // 2 seconds after start
        isAutoSubmitted: false,
      };

      const score = scoringService.calculatePlayerScore(submission, 3, phaseStartTime);

      expect(score.playerId).toBe('player1');
      expect(score.votePoints).toBe(300);
      expect(score.speedBonus).toBe(40);
      expect(score.totalPoints).toBe(340);
      expect(score.votesReceived).toBe(3);
      expect(score.submissionTimeMs).toBe(2000);
    });

    it('should handle auto-submitted drawing', () => {
      const submission: DrawingSubmission = {
        playerId: 'player1',
        drawingData: 'data1',
        submittedAt: 3000,
        isAutoSubmitted: true,
      };

      const score = scoringService.calculatePlayerScore(submission, 2, phaseStartTime);

      expect(score.speedBonus).toBe(0);
      expect(score.submissionTimeMs).toBeNull();
      expect(score.totalPoints).toBe(200);
    });
  });

  describe('findRoundWinners', () => {
    it('should find single winner', () => {
      const scores: PlayerRoundScore[] = [
        {
          playerId: 'player1',
          votePoints: 200,
          speedBonus: 40,
          totalPoints: 240,
          votesReceived: 2,
          submissionTimeMs: 2000,
        },
        {
          playerId: 'player2',
          votePoints: 100,
          speedBonus: 25,
          totalPoints: 125,
          votesReceived: 1,
          submissionTimeMs: 5000,
        },
      ];

      const winners = scoringService.findRoundWinners(scores);

      expect(winners.length).toBe(1);
      expect(winners[0].playerId).toBe('player1');
    });

    it('should find multiple winners in case of tie', () => {
      const scores: PlayerRoundScore[] = [
        {
          playerId: 'player1',
          votePoints: 100,
          speedBonus: 50,
          totalPoints: 150,
          votesReceived: 1,
          submissionTimeMs: 0,
        },
        {
          playerId: 'player2',
          votePoints: 100,
          speedBonus: 50,
          totalPoints: 150,
          votesReceived: 1,
          submissionTimeMs: 0,
        },
        {
          playerId: 'player3',
          votePoints: 100,
          speedBonus: 25,
          totalPoints: 125,
          votesReceived: 1,
          submissionTimeMs: 5000,
        },
      ];

      const winners = scoringService.findRoundWinners(scores);

      expect(winners.length).toBe(2);
      expect(winners.map((w) => w.playerId)).toContain('player1');
      expect(winners.map((w) => w.playerId)).toContain('player2');
    });

    it('should return empty array for empty scores', () => {
      const winners = scoringService.findRoundWinners([]);

      expect(winners.length).toBe(0);
    });

    it('should handle all players tied', () => {
      const scores: PlayerRoundScore[] = [
        {
          playerId: 'player1',
          votePoints: 100,
          speedBonus: 25,
          totalPoints: 125,
          votesReceived: 1,
          submissionTimeMs: 5000,
        },
        {
          playerId: 'player2',
          votePoints: 100,
          speedBonus: 25,
          totalPoints: 125,
          votesReceived: 1,
          submissionTimeMs: 5000,
        },
        {
          playerId: 'player3',
          votePoints: 100,
          speedBonus: 25,
          totalPoints: 125,
          votesReceived: 1,
          submissionTimeMs: 5000,
        },
      ];

      const winners = scoringService.findRoundWinners(scores);

      expect(winners.length).toBe(3);
    });
  });

  describe('calculateCumulativeScores', () => {
    it('should sum scores across multiple rounds', () => {
      const round1: PlayerRoundScore[] = [
        {
          playerId: 'player1',
          votePoints: 200,
          speedBonus: 40,
          totalPoints: 240,
          votesReceived: 2,
          submissionTimeMs: 2000,
        },
        {
          playerId: 'player2',
          votePoints: 100,
          speedBonus: 25,
          totalPoints: 125,
          votesReceived: 1,
          submissionTimeMs: 5000,
        },
      ];

      const round2: PlayerRoundScore[] = [
        {
          playerId: 'player1',
          votePoints: 100,
          speedBonus: 50,
          totalPoints: 150,
          votesReceived: 1,
          submissionTimeMs: 0,
        },
        {
          playerId: 'player2',
          votePoints: 300,
          speedBonus: 30,
          totalPoints: 330,
          votesReceived: 3,
          submissionTimeMs: 4000,
        },
      ];

      const cumulative = scoringService.calculateCumulativeScores([round1, round2]);

      expect(cumulative.get('player1')).toBe(390); // 240 + 150
      expect(cumulative.get('player2')).toBe(455); // 125 + 330
    });

    it('should handle players joining mid-game', () => {
      const round1: PlayerRoundScore[] = [
        {
          playerId: 'player1',
          votePoints: 200,
          speedBonus: 40,
          totalPoints: 240,
          votesReceived: 2,
          submissionTimeMs: 2000,
        },
      ];

      const round2: PlayerRoundScore[] = [
        {
          playerId: 'player1',
          votePoints: 100,
          speedBonus: 50,
          totalPoints: 150,
          votesReceived: 1,
          submissionTimeMs: 0,
        },
        {
          playerId: 'player2', // Joined in round 2
          votePoints: 200,
          speedBonus: 25,
          totalPoints: 225,
          votesReceived: 2,
          submissionTimeMs: 5000,
        },
      ];

      const cumulative = scoringService.calculateCumulativeScores([round1, round2]);

      expect(cumulative.get('player1')).toBe(390);
      expect(cumulative.get('player2')).toBe(225);
    });

    it('should handle empty rounds array', () => {
      const cumulative = scoringService.calculateCumulativeScores([]);

      expect(cumulative.size).toBe(0);
    });

    it('should handle rounds with no scores', () => {
      const emptyRound: PlayerRoundScore[] = [];

      const cumulative = scoringService.calculateCumulativeScores([emptyRound, emptyRound]);

      expect(cumulative.size).toBe(0);
    });
  });

  describe('createManualSubmission', () => {
    it('should create submission with isAutoSubmitted = false', () => {
      const submission = scoringService.createManualSubmission('player1', 'base64data', 5000);

      expect(submission.playerId).toBe('player1');
      expect(submission.drawingData).toBe('base64data');
      expect(submission.submittedAt).toBe(5000);
      expect(submission.isAutoSubmitted).toBe(false);
    });

    it('should use current time if not provided', () => {
      const before = Date.now();
      const submission = scoringService.createManualSubmission('player1', 'data');
      const after = Date.now();

      expect(submission.submittedAt).toBeGreaterThanOrEqual(before);
      expect(submission.submittedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('createAutoSubmission', () => {
    it('should create submission with isAutoSubmitted = true', () => {
      const submission = scoringService.createAutoSubmission('player1', 'base64data', 5000);

      expect(submission.playerId).toBe('player1');
      expect(submission.drawingData).toBe('base64data');
      expect(submission.submittedAt).toBe(5000);
      expect(submission.isAutoSubmitted).toBe(true);
    });

    it('should handle empty drawing data for blank drawings', () => {
      const submission = scoringService.createAutoSubmission('player1', '', 5000);

      expect(submission.drawingData).toBe('');
      expect(submission.isAutoSubmitted).toBe(true);
    });

    it('should use current time if not provided', () => {
      const before = Date.now();
      const submission = scoringService.createAutoSubmission('player1', 'data');
      const after = Date.now();

      expect(submission.submittedAt).toBeGreaterThanOrEqual(before);
      expect(submission.submittedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('edge cases', () => {
    it('should handle extremely fast submissions (1ms)', () => {
      const bonus = scoringService.calculateSpeedBonus(1, false);
      // At 1ms: 50 * (1 - 0.0001) ≈ 50
      expect(bonus).toBe(50);
    });

    it('should handle exact boundary time (9999ms)', () => {
      const bonus = scoringService.calculateSpeedBonus(9999, false);
      // At 9999ms: 50 * (1 - 0.9999) = 0.005, rounds to 0
      expect(bonus).toBe(0);
    });

    it('should give small bonus just under boundary (9500ms)', () => {
      const bonus = scoringService.calculateSpeedBonus(9500, false);
      // At 9500ms: 50 * (1 - 0.95) = 50 * 0.05 = 2.5, rounds to 3 (using Math.round)
      expect(bonus).toBe(3);
    });

    it('should handle single player game', () => {
      const submissions: DrawingSubmission[] = [
        {
          playerId: 'player1',
          drawingData: 'data1',
          submittedAt: 3000,
          isAutoSubmitted: false,
        },
      ];

      const votes = new Map<string, string>();
      // In a real game, single player can't vote for themselves
      // So they'd get 0 votes

      const scores = scoringService.calculateRoundScores(submissions, votes, 1000);

      expect(scores.length).toBe(1);
      expect(scores[0].votePoints).toBe(0);
      expect(scores[0].speedBonus).toBe(40); // 2 seconds
      expect(scores[0].totalPoints).toBe(40);
    });

    it('should handle large number of votes', () => {
      const votePoints = scoringService.calculateVotePoints(100);
      expect(votePoints).toBe(10000);
    });

    it('should handle many players scenario', () => {
      const submissions: DrawingSubmission[] = [];
      const votes = new Map<string, string>();

      // Create 8 players
      for (let i = 0; i < 8; i++) {
        submissions.push({
          playerId: `player${i}`,
          drawingData: `data${i}`,
          submittedAt: 1000 + i * 1000, // Staggered submissions
          isAutoSubmitted: false,
        });
      }

      // Each player votes for the next one (7 votes total, player0 gets none)
      for (let i = 0; i < 7; i++) {
        votes.set(`voter${i}`, `player${(i + 1) % 8}`);
      }

      const scores = scoringService.calculateRoundScores(submissions, votes, 0);

      expect(scores.length).toBe(8);
      // Should be sorted by total points
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i].totalPoints).toBeGreaterThanOrEqual(scores[i + 1].totalPoints);
      }
    });
  });
});
