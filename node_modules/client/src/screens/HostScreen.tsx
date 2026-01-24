/**
 * HostScreen - Main display screen for the party game
 *
 * This screen is shown on the shared/main display (TV, tablet, etc.)
 * and renders different components based on the current game state:
 * - HostLobby: Waiting for players, showing QR code and room code
 * - Countdown: 3-2-1-GO! before round starts
 * - QuestionDisplay: Shows current question and timer during drawing phase
 * - DrawingGallery: Displays all drawings during voting phase
 * - VotingResults: Shows round winner and scores
 * - Leaderboard: Final standings with podium animation
 */

import { useEffect } from 'react';
import { useGameState, RoomStatus } from '../hooks/useGameState';
import HostLobby from '../components/host/HostLobby';
import Countdown from '../components/host/Countdown';
import QuestionDisplay from '../components/host/QuestionDisplay';
import DrawingGallery from '../components/host/DrawingGallery';

// TODO: Import actual components when implemented (TASK-030, TASK-034 to TASK-035)
// import VotingResults from '../components/host/VotingResults';
// import Leaderboard from '../components/host/Leaderboard';

interface HostScreenProps {
  deviceId: string;
}


/**
 * Placeholder component for VotingResults (TASK-034)
 * Shows round winner and score breakdown
 */
function VotingResultsPlaceholder({
  winners,
  voteResults,
  round,
}: {
  winners: Array<{ playerId: string; playerName: string; votes: number }>;
  voteResults: Array<{
    playerId: string;
    playerName: string;
    votes: number;
    pointsEarned: number;
  }>;
  round: number;
}) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-purple-800 mb-6">
        Round {round} Results
      </h2>
      {winners.length > 0 && (
        <div className="mb-8">
          <p className="text-xl text-purple-600 mb-2">Winner</p>
          <p className="text-4xl font-bold text-yellow-600">
            🏆 {winners[0].playerName}
          </p>
          <p className="text-lg text-gray-600">{winners[0].votes} votes</p>
        </div>
      )}
      <div className="space-y-2">
        {voteResults.map((result) => (
          <div
            key={result.playerId}
            className="bg-white rounded-lg px-4 py-3 flex justify-between items-center"
          >
            <span className="font-medium">{result.playerName}</span>
            <span className="text-purple-700">
              {result.votes} votes (+{result.pointsEarned} pts)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Placeholder component for Leaderboard (TASK-035)
 * Shows final standings with podium
 */
function LeaderboardPlaceholder({
  standings,
  winner,
}: {
  standings: Array<{ playerId: string; playerName: string; score: number }>;
  winner: { playerId: string; playerName: string; score: number } | null;
}) {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-purple-800 mb-8">Final Results!</h2>
      {winner && (
        <div className="mb-8">
          <p className="text-2xl text-yellow-600 mb-2">🎉 Winner 🎉</p>
          <p className="text-5xl font-bold text-purple-700">{winner.playerName}</p>
          <p className="text-2xl text-gray-600 mt-2">{winner.score} points</p>
        </div>
      )}
      <div className="max-w-md mx-auto space-y-3">
        {standings.map((entry, index) => (
          <div
            key={entry.playerId}
            className={`rounded-lg px-6 py-4 flex justify-between items-center ${
              index === 0
                ? 'bg-yellow-100 border-2 border-yellow-400'
                : index === 1
                ? 'bg-gray-100 border-2 border-gray-400'
                : index === 2
                ? 'bg-orange-100 border-2 border-orange-400'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-500">
                #{index + 1}
              </span>
              <span className="font-medium text-lg">{entry.playerName}</span>
            </div>
            <span className="text-xl font-bold text-purple-700">
              {entry.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Renders the appropriate component based on game status
 */
function renderGameContent(
  status: RoomStatus,
  gameState: ReturnType<typeof useGameState>['gameState']
) {
  switch (status) {
    case 'lobby':
      return (
        <HostLobby
          roomCode={gameState.roomCode || '------'}
          players={gameState.players}
        />
      );

    case 'countdown':
      return <Countdown count={gameState.countdownValue} />;

    case 'drawing':
      return (
        <QuestionDisplay
          question={gameState.question || ''}
          timerSeconds={gameState.timerSeconds}
          submittedCount={gameState.submittedCount}
          totalPlayers={gameState.players.length}
          round={gameState.currentRound}
          totalRounds={gameState.totalRounds}
        />
      );

    case 'voting':
      return (
        <DrawingGallery
          drawings={gameState.drawings}
          timerSeconds={gameState.timerSeconds}
          players={gameState.players}
          votedCount={gameState.votedCount}
          totalVoters={gameState.players.length}
        />
      );

    case 'results':
      return (
        <VotingResultsPlaceholder
          winners={gameState.winners}
          voteResults={gameState.voteResults}
          round={gameState.currentRound}
        />
      );

    case 'final':
      return (
        <LeaderboardPlaceholder
          standings={gameState.finalStandings}
          winner={gameState.finalWinner}
        />
      );

    default:
      return (
        <div className="text-center text-gray-600">
          Unknown game state: {status}
        </div>
      );
  }
}

function HostScreen({ deviceId }: HostScreenProps) {
  const { gameState, createRoom } = useGameState();

  // Automatically create a room when the host screen mounts
  useEffect(() => {
    if (!gameState.inRoom) {
      createRoom();
    }
  }, [gameState.inRoom, createRoom]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          PartyDraw
        </h1>
        {gameState.inRoom && gameState.roomCode && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-white font-medium">
              Room: {gameState.roomCode}
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
          {/* Error display */}
          {gameState.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {gameState.error}
            </div>
          )}

          {/* Loading state while room is being created */}
          {!gameState.inRoom && !gameState.error && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
              <p className="text-lg text-gray-600">Creating room...</p>
            </div>
          )}

          {/* Game content based on status */}
          {gameState.inRoom && renderGameContent(gameState.status, gameState)}
        </div>
      </main>

      {/* Footer with debug info */}
      <footer className="py-2 px-6 text-center text-white/60 text-sm">
        Device: {deviceId} | Status: {gameState.status}
        {gameState.currentRound > 0 &&
          ` | Round ${gameState.currentRound}/${gameState.totalRounds}`}
      </footer>
    </div>
  );
}

export default HostScreen;
