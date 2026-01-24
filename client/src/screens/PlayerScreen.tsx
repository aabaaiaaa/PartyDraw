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

interface PlayerScreenProps {
  deviceId: string;
}

function PlayerScreen({ deviceId }: PlayerScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-teal-800 mb-4">
          PartyDraw
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Player Screen
        </p>
        <div className="bg-teal-100 rounded-lg p-4 text-center">
          <p className="text-sm text-teal-700">Device ID: {deviceId}</p>
          <p className="text-lg text-teal-800 mt-2">
            Waiting for game components to be implemented...
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlayerScreen;
