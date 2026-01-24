/**
 * URL Parameter Parsing for TestBoardBed Device Identification
 *
 * This module parses URL parameters to determine device roles:
 * - sharedDeviceId: Identifies the host/main screen (displays game state, QR codes, results)
 * - playerDeviceId: Identifies a player device (used for drawing and voting)
 *
 * TestBoardBed sets these parameters when loading the app in iframes
 * to simulate multiple devices during development and testing.
 */

export interface DeviceParams {
  /** ID for the shared/host screen - present when device should act as host */
  sharedDeviceId: string | null;
  /** ID for a player device - present when device should act as a player */
  playerDeviceId: string | null;
  /** Whether this device is the host screen */
  isHost: boolean;
  /** Whether this device is a player screen */
  isPlayer: boolean;
  /** The device ID (either shared or player) */
  deviceId: string | null;
}

/**
 * Parses URL search parameters to extract device identification params.
 *
 * @param searchParams - URLSearchParams object (defaults to current window location)
 * @returns DeviceParams object with parsed values
 *
 * @example
 * // Host screen URL: http://localhost:5175/?sharedDeviceId=host-123
 * const params = parseDeviceParams();
 * // { sharedDeviceId: 'host-123', playerDeviceId: null, isHost: true, isPlayer: false, deviceId: 'host-123' }
 *
 * @example
 * // Player screen URL: http://localhost:5175/?playerDeviceId=player-456
 * const params = parseDeviceParams();
 * // { sharedDeviceId: null, playerDeviceId: 'player-456', isHost: false, isPlayer: true, deviceId: 'player-456' }
 */
export function parseDeviceParams(
  searchParams: URLSearchParams = new URLSearchParams(window.location.search)
): DeviceParams {
  const sharedDeviceId = searchParams.get('sharedDeviceId');
  const playerDeviceId = searchParams.get('playerDeviceId');

  const isHost = sharedDeviceId !== null && sharedDeviceId.length > 0;
  const isPlayer = playerDeviceId !== null && playerDeviceId.length > 0;

  return {
    sharedDeviceId: sharedDeviceId || null,
    playerDeviceId: playerDeviceId || null,
    isHost,
    isPlayer,
    deviceId: sharedDeviceId || playerDeviceId || null,
  };
}

/**
 * Gets the current device params from the window location.
 * This is a convenience function that calls parseDeviceParams with the current URL.
 *
 * @returns DeviceParams object with parsed values from current URL
 */
export function getDeviceParams(): DeviceParams {
  return parseDeviceParams();
}

/**
 * Determines the device role based on URL parameters.
 *
 * @returns 'host' | 'player' | 'unknown'
 */
export function getDeviceRole(): 'host' | 'player' | 'unknown' {
  const params = getDeviceParams();

  if (params.isHost) {
    return 'host';
  }

  if (params.isPlayer) {
    return 'player';
  }

  return 'unknown';
}

/**
 * Generates a URL with device parameters for testing purposes.
 *
 * @param baseUrl - The base URL to append parameters to
 * @param deviceType - 'host' or 'player'
 * @param deviceId - The device ID to use
 * @returns The URL with device parameters appended
 */
export function generateDeviceUrl(
  baseUrl: string,
  deviceType: 'host' | 'player',
  deviceId: string
): string {
  const url = new URL(baseUrl);

  if (deviceType === 'host') {
    url.searchParams.set('sharedDeviceId', deviceId);
  } else {
    url.searchParams.set('playerDeviceId', deviceId);
  }

  return url.toString();
}
