/**
 * QRCodeDisplay - Renders a scannable QR code for the room join URL
 *
 * Uses qrcode.react to generate a QR code that players can scan
 * with their phones to quickly join the game room.
 */

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  /** The URL to encode in the QR code */
  url: string;
  /** Size of the QR code in pixels (default: 192 - which is 48 * 4 for retina) */
  size?: number;
  /** Background color (default: white) */
  bgColor?: string;
  /** Foreground color (default: dark purple to match theme) */
  fgColor?: string;
  /** Whether to include a logo/icon in the center */
  includeIcon?: boolean;
}

/**
 * QRCodeDisplay component - Displays a scannable QR code for room joining
 */
function QRCodeDisplay({
  url,
  size = 192,
  bgColor = '#ffffff',
  fgColor = '#4c1d95', // Purple-900 to match party theme
  includeIcon = false,
}: QRCodeDisplayProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
      <div className="rounded-lg overflow-hidden">
        <QRCodeSVG
          value={url}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="M" // Medium error correction - good balance of density and reliability
          marginSize={2}
          imageSettings={
            includeIcon
              ? {
                  src: '/logo.png',
                  x: undefined, // Center automatically
                  y: undefined, // Center automatically
                  height: 32,
                  width: 32,
                  excavate: true, // Clear space behind the image
                }
              : undefined
          }
        />
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Scan to join</p>
    </div>
  );
}

export default QRCodeDisplay;
