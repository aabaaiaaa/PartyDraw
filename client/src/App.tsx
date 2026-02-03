import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { getDeviceParams } from './utils/deviceId';
import HostScreen from './screens/HostScreen';
import PlayerScreen from './screens/PlayerScreen';
import LandingScreen from './screens/LandingScreen';
import { initConsoleCapture } from './utils/ConsoleCapture';

function App() {
  // Parse device parameters from URL to determine which screen to render
  const deviceParams = useMemo(() => getDeviceParams(), []);

  // User-selected role (when no URL params are present)
  const [userRole, setUserRole] = useState<'host' | 'player' | null>(null);

  // Initialize ConsoleCapture on mount for TestBoardBed integration
  useEffect(() => {
    initConsoleCapture();

    // Log device info for debugging
    console.log('[PartyDraw] Device params:', deviceParams);
    console.log('[PartyDraw] Device role:', deviceParams.isHost ? 'host' : deviceParams.isPlayer ? 'player' : 'unknown');
  }, [deviceParams]);

  // Routing priority:
  // 1. URL params (for E2E testing) - takes precedence
  // 2. User-selected role
  // 3. Landing page (default)

  // Render HostScreen if sharedDeviceId URL param is present (E2E testing)
  if (deviceParams.isHost && deviceParams.sharedDeviceId) {
    return <HostScreen deviceId={deviceParams.sharedDeviceId} />;
  }

  // Render PlayerScreen if playerDeviceId URL param is present (E2E testing)
  if (deviceParams.isPlayer && deviceParams.playerDeviceId) {
    return <PlayerScreen deviceId={deviceParams.playerDeviceId} />;
  }

  // Render based on user-selected role
  if (userRole === 'host') {
    return <HostScreen deviceId={`user-host-${Date.now()}`} />;
  }

  if (userRole === 'player') {
    return <PlayerScreen deviceId={`user-player-${Date.now()}`} />;
  }

  // No URL params and no role selected - show landing page
  return (
    <LandingScreen
      onCreateRoom={() => setUserRole('host')}
      onJoinRoom={() => setUserRole('player')}
    />
  );
}

export default App;
