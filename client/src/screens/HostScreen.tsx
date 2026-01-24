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

interface HostScreenProps {
  deviceId: string;
}

function HostScreen({ deviceId }: HostScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
        <h1 className="text-4xl font-bold text-center text-purple-800 mb-4">
          PartyDraw
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Host Screen
        </p>
        <div className="bg-purple-100 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-700">Device ID: {deviceId}</p>
          <p className="text-lg text-purple-800 mt-2">
            Waiting for game components to be implemented...
          </p>
        </div>
      </div>
    </div>
  );
}

export default HostScreen;
