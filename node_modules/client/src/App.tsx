import { useEffect, useMemo } from 'react';
import './App.css';
import { getDeviceParams } from './utils/deviceId';
import HostScreen from './screens/HostScreen';
import PlayerScreen from './screens/PlayerScreen';
// TODO: Import ConsoleCapture when TASK-007 is complete
// import { initConsoleCapture } from './utils/ConsoleCapture';

function App() {
  // Parse device parameters from URL to determine which screen to render
  const deviceParams = useMemo(() => getDeviceParams(), []);

  // Initialize ConsoleCapture on mount for TestBoardBed integration
  useEffect(() => {
    // TODO: Initialize ConsoleCapture when TASK-007 is complete
    // initConsoleCapture();

    // Log device info for debugging
    console.log('[PartyDraw] Device params:', deviceParams);
    console.log('[PartyDraw] Device role:', deviceParams.isHost ? 'host' : deviceParams.isPlayer ? 'player' : 'unknown');
  }, [deviceParams]);

  // Render HostScreen if sharedDeviceId is present
  if (deviceParams.isHost && deviceParams.sharedDeviceId) {
    return <HostScreen deviceId={deviceParams.sharedDeviceId} />;
  }

  // Otherwise render PlayerScreen (default view for players and unknown devices)
  return <PlayerScreen deviceId={deviceParams.deviceId || 'unknown'} />;
}

export default App;
