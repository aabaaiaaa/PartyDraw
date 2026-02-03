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
import { useSocket } from '../hooks/useSocket';
import HostLobby from '../components/host/HostLobby';
import Countdown from '../components/host/Countdown';
import QuestionDisplay from '../components/host/QuestionDisplay';
import DrawingGallery from '../components/host/DrawingGallery';
import VotingResults from '../components/host/VotingResults';
import Leaderboard from '../components/host/Leaderboard';
import { ConnectionStatus, ReconnectingOverlay, ErrorMessage } from '../components/common';

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
          skipVoteCount={gameState.skipVoteCount}
          skipVoteThreshold={gameState.skipVoteThreshold}
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
  const { gameState, createRoom, resetGame, startGame, clearError } = useGameState();
  const { connectionState, connect } = useSocket();

  // Automatically create a room when the host screen mounts
  useEffect(() => {
    if (!gameState.inRoom && connectionState === 'connected') {
      createRoom();
    }
  }, [gameState.inRoom, createRoom, connectionState]);

  // Handle play again - reset game while keeping same room
  const handlePlayAgain = () => {
    resetGame();
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex flex-col">
      {/* Connection status indicator */}
      <ConnectionStatus connectionState={connectionState} position="top-right" />

      {/* Reconnecting overlay - blocks interaction when connection is lost */}
      <ReconnectingOverlay
        connectionState={connectionState}
        onRetry={connect}
        maxAutoAttempts={5}
      />

      {/* Header - fixed height */}
      <header className="flex-none py-3 px-4 sm:py-4 sm:px-6 lg:py-5 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-lg">
          PartyDraw
        </h1>
        {gameState.inRoom && gameState.roomCode && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5">
            <span className="text-white font-medium text-sm sm:text-base lg:text-lg">
              Room: {gameState.roomCode}
            </span>
          </div>
        )}
      </header>

      {/* Main Content - flex-1 to fill remaining space */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl w-full h-full flex flex-col overflow-hidden">
          {/* Friendly error message display */}
          {gameState.error && (
            <div className="mb-4 sm:mb-6">
              <ErrorMessage
                error={gameState.error}
                onDismiss={clearError}
                dismissible={true}
              />
            </div>
          )}

          {/* Loading state while room is being created */}
          {!gameState.inRoom && !gameState.error && connectionState === 'connected' && (
            <div className="text-center flex-1 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">Creating room...</p>
            </div>
          )}

          {/* Waiting for connection */}
          {!gameState.inRoom && !gameState.error && connectionState !== 'connected' && (
            <div className="text-center flex-1 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">Connecting to server...</p>
            </div>
          )}

          {/* Game content based on status - flex-1 to fill available space */}
          <div className="flex-1 flex flex-col">
            {gameState.inRoom && renderGameContent(gameState.status, gameState, handlePlayAgain, startGame)}
          </div>
        </div>
      </main>

      {/* Footer with debug info - fixed height */}
      <footer className="flex-none py-1.5 px-4 sm:py-2 sm:px-6 text-center text-white/60 text-xs sm:text-sm">
        <span className="hidden xs:inline">Device: {deviceId} | </span>
        Status: {gameState.status}
        {gameState.currentRound > 0 &&
          ` | Round ${gameState.currentRound}/${gameState.totalRounds}`}
      </footer>
    </div>
  );
}

export default HostScreen;
