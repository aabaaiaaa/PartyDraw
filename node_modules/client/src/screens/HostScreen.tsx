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
import VotingResults from '../components/host/VotingResults';
import Leaderboard from '../components/host/Leaderboard';

// TODO: Import actual component when implemented (TASK-030)
// import QRCodeDisplay from '../components/host/QRCodeDisplay';

interface HostScreenProps {
  deviceId: string;
}



/**
 * Renders the appropriate component based on game status
 */
function renderGameContent(
  status: RoomStatus,
  gameState: ReturnType<typeof useGameState>['gameState'],
  onPlayAgain?: () => void,
  onStartGame?: () => void
) {
  switch (status) {
    case 'lobby':
      return (
        <HostLobby
          roomCode={gameState.roomCode || '------'}
          players={gameState.players}
          onStartGame={onStartGame}
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
        <VotingResults
          winners={gameState.winners}
          voteResults={gameState.voteResults}
          round={gameState.currentRound}
          totalRounds={gameState.totalRounds}
          drawings={gameState.drawings}
          players={gameState.players}
        />
      );

    case 'final':
      return (
        <Leaderboard
          standings={gameState.finalStandings}
          winner={gameState.finalWinner}
          players={gameState.players}
          onPlayAgain={onPlayAgain}
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
  const { gameState, createRoom, resetState, startGame } = useGameState();

  // Automatically create a room when the host screen mounts
  useEffect(() => {
    if (!gameState.inRoom) {
      createRoom();
    }
  }, [gameState.inRoom, createRoom]);

  // Handle play again - reset state and create new room
  const handlePlayAgain = () => {
    resetState();
    // Room will be created automatically via the useEffect above
  };

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
          {gameState.inRoom && renderGameContent(gameState.status, gameState, handlePlayAgain, startGame)}
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
