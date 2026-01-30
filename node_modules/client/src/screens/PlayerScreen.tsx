/**
 * PlayerScreen - Player device screen for the party game
 *
 * This screen is shown on player devices (phones) and renders different
 * components based on the current game state:
 * - JoinScreen: Room code input to join a game
 * - NamePicker: Choose/generate player name and mark ready
 * - WaitingScreen: Waiting for host to start or next round
 * - DrawingCanvas: Draw response to the question
 * - VotingInterface: Vote for favorite drawing
 * - Score display: Show current scores between rounds
 */

import { useGameState, Player, VoteResult, ScoreEntry } from '../hooks/useGameState';
import JoinScreen from '../components/player/JoinScreen';
import NamePicker from '../components/player/NamePicker';
import WaitingScreen from '../components/player/WaitingScreen';
import DrawingCanvas from '../components/player/DrawingCanvas';
import VotingInterface from '../components/player/VotingInterface';

interface PlayerScreenProps {
  deviceId: string;
}


/**
 * Score Display component for showing round results
 */
function ScoreDisplay({
  voteResults,
  players,
  currentPlayerId,
  round,
  totalRounds,
}: {
  voteResults: VoteResult[];
  players: Player[];
  currentPlayerId: string | undefined;
  round: number;
  totalRounds: number;
}) {
  const getPlayerColor = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player?.color || '#888888';
  };

  const currentPlayerResult = voteResults.find((r) => r.playerId === currentPlayerId);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-teal-800 mb-2">Round {round} Results</h2>
      <p className="text-gray-600 mb-4">
        {round < totalRounds ? 'Next round starting soon...' : 'Final results coming!'}
      </p>

      {/* Current player score highlight */}
      {currentPlayerResult && (
        <div className="bg-teal-100 rounded-lg p-4 mb-4">
          <p className="text-lg font-semibold text-teal-800">Your Score</p>
          <p className="text-3xl font-bold text-teal-600">
            +{currentPlayerResult.pointsEarned}
          </p>
          <p className="text-sm text-teal-600">
            {currentPlayerResult.votes} vote{currentPlayerResult.votes !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* All results */}
      <div className="space-y-2">
        {voteResults
          .sort((a, b) => b.pointsEarned - a.pointsEarned)
          .map((result, index) => (
            <div
              key={result.playerId}
              className={`flex items-center justify-between p-2 rounded-lg ${
                result.playerId === currentPlayerId
                  ? 'bg-teal-50 border border-teal-200'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-6">{index + 1}.</span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                  style={{ backgroundColor: getPlayerColor(result.playerId) }}
                >
                  {result.playerName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{result.playerName}</span>
              </div>
              <span className="text-sm font-bold text-teal-600">+{result.pointsEarned}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * Final Standings component for game end
 */
function FinalStandings({
  standings,
  winner,
  players,
  currentPlayerId,
  onPlayAgain,
}: {
  standings: ScoreEntry[];
  winner: ScoreEntry | null;
  players: Player[];
  currentPlayerId: string | undefined;
  onPlayAgain: () => void;
}) {
  const getPlayerColor = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player?.color || '#888888';
  };

  const currentPlayerStanding = standings.findIndex((s) => s.playerId === currentPlayerId);
  const isWinner = winner?.playerId === currentPlayerId;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-teal-800 mb-2">Game Over!</h2>

      {/* Winner announcement */}
      {winner && (
        <div className="mb-4">
          {isWinner ? (
            <p className="text-xl text-yellow-500 font-bold animate-pulse">
              🎉 You Won! 🎉
            </p>
          ) : (
            <p className="text-lg text-gray-600">
              Winner: <span className="font-bold">{winner.playerName}</span>
            </p>
          )}
        </div>
      )}

      {/* Current player position */}
      {currentPlayerStanding >= 0 && (
        <div className="bg-teal-100 rounded-lg p-4 mb-4">
          <p className="text-lg font-semibold text-teal-800">Your Position</p>
          <p className="text-3xl font-bold text-teal-600">
            #{currentPlayerStanding + 1}
          </p>
          <p className="text-lg text-teal-600">
            {standings[currentPlayerStanding]?.score || 0} points
          </p>
        </div>
      )}

      {/* Standings list */}
      <div className="space-y-2 mb-6">
        {standings.slice(0, 5).map((entry, index) => (
          <div
            key={entry.playerId}
            className={`flex items-center justify-between p-2 rounded-lg ${
              entry.playerId === currentPlayerId
                ? 'bg-teal-50 border border-teal-200'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-500 w-6 font-bold">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </span>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                style={{ backgroundColor: getPlayerColor(entry.playerId) }}
              >
                {entry.playerName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{entry.playerName}</span>
            </div>
            <span className="text-sm font-bold text-teal-600">{entry.score}</span>
          </div>
        ))}
      </div>

      {/* Play again button */}
      <button
        onClick={onPlayAgain}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Play Again
      </button>
    </div>
  );
}

/**
 * Renders the appropriate component based on game status for player
 */
function renderPlayerContent(
  gameState: ReturnType<typeof useGameState>['gameState'],
  actions: {
    joinRoom: (code: string) => void;
    updateName: (name: string) => void;
    setReady: (ready: boolean) => void;
    submitDrawing: (data: string) => void;
    castVote: (votedForId: string) => void;
    resetState: () => void;
  }
) {
  // Not in a room - show join screen
  if (!gameState.inRoom) {
    return (
      <JoinScreen
        onJoin={actions.joinRoom}
        error={gameState.error}
      />
    );
  }

  // In lobby - show name picker or waiting screen based on ready status
  if (gameState.status === 'lobby' && gameState.currentPlayer) {
    // If player is ready, show WaitingScreen
    if (gameState.currentPlayer.isReady) {
      return (
        <WaitingScreen
          players={gameState.players}
          currentPlayerId={gameState.currentPlayer.id}
          onCancelReady={() => actions.setReady(false)}
        />
      );
    }

    // Otherwise show NamePicker
    return (
      <NamePicker
        player={gameState.currentPlayer}
        onUpdateName={actions.updateName}
        onReady={actions.setReady}
        isReady={gameState.currentPlayer.isReady}
      />
    );
  }

  // Countdown - show waiting with countdown
  if (gameState.status === 'countdown') {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-teal-800 mb-4">Get Ready!</h2>
        <div className="text-6xl font-bold text-purple-600 animate-pulse">
          {gameState.countdownValue || '...'}
        </div>
      </div>
    );
  }

  // Drawing phase - show canvas
  if (gameState.status === 'drawing') {
    return (
      <DrawingCanvas
        question={gameState.question || ''}
        timerSeconds={gameState.timerSeconds}
        onSubmit={actions.submitDrawing}
        hasSubmitted={gameState.hasSubmittedDrawing}
        drawingPhaseEnded={gameState.drawingPhaseEnded}
      />
    );
  }

  // Voting phase - show voting interface
  if (gameState.status === 'voting') {
    return (
      <VotingInterface
        drawings={gameState.drawings}
        players={gameState.players}
        currentPlayerId={gameState.currentPlayer?.id}
        timerSeconds={gameState.timerSeconds}
        onVote={actions.castVote}
        hasVoted={gameState.hasVoted}
      />
    );
  }

  // Results phase - show score display
  if (gameState.status === 'results') {
    return (
      <ScoreDisplay
        voteResults={gameState.voteResults}
        players={gameState.players}
        currentPlayerId={gameState.currentPlayer?.id}
        round={gameState.currentRound}
        totalRounds={gameState.totalRounds}
      />
    );
  }

  // Final phase - show final standings
  if (gameState.status === 'final') {
    return (
      <FinalStandings
        standings={gameState.finalStandings}
        winner={gameState.finalWinner}
        players={gameState.players}
        currentPlayerId={gameState.currentPlayer?.id}
        onPlayAgain={actions.resetState}
      />
    );
  }

  // Unknown state - show basic waiting message
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4" />
      <p className="text-lg text-gray-700 mb-4">Loading...</p>
      <p className="text-sm text-gray-500">Status: {gameState.status}</p>
    </div>
  );
}

function PlayerScreen({ deviceId }: PlayerScreenProps) {
  const {
    gameState,
    joinRoom,
    updateName,
    setReady,
    submitDrawing,
    castVote,
    resetState,
    clearError,
  } = useGameState();

  const actions = {
    joinRoom,
    updateName,
    setReady,
    submitDrawing,
    castVote,
    resetState,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex flex-col">
      {/* Header */}
      <header className="py-3 px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white drop-shadow-lg">
          PartyDraw
        </h1>
        {gameState.inRoom && gameState.roomCode && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-white text-sm font-medium">
              {gameState.roomCode}
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-md w-full">
          {/* Dismissible error display */}
          {gameState.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 flex items-center justify-between">
              <span className="text-sm">{gameState.error}</span>
              <button
                onClick={clearError}
                className="text-red-700 hover:text-red-900 ml-2"
              >
                ×
              </button>
            </div>
          )}

          {/* Game content based on status */}
          {renderPlayerContent(gameState, actions)}
        </div>
      </main>

      {/* Footer with debug info */}
      <footer className="py-2 px-4 text-center text-white/60 text-xs">
        Device: {deviceId} | Status: {gameState.status}
        {gameState.currentRound > 0 &&
          ` | Round ${gameState.currentRound}/${gameState.totalRounds}`}
        {gameState.currentPlayer && ` | ${gameState.currentPlayer.name}`}
      </footer>
    </div>
  );
}

export default PlayerScreen;
