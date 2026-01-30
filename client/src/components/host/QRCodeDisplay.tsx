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
 * Responsive sizing for different screen sizes
 */
function QRCodeDisplay({
  url,
  size = 192,
  bgColor = '#ffffff',
  fgColor = '#4c1d95', // Purple-900 to match party theme
  includeIcon = false,
}: QRCodeDisplayProps) {
  // Responsive QR code sizing based on viewport
  // Default size is passed but we use CSS to handle responsive display
  return (
    <div className="bg-white p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-lg inline-block">
      <div className="rounded sm:rounded-lg overflow-hidden">
        {/* Small screens (phones/small tablets) */}
        <div className="block sm:hidden">
          <QRCodeSVG
            value={url}
            size={140}
            bgColor={bgColor}
            fgColor={fgColor}
            level="M"
            marginSize={2}
            imageSettings={
              includeIcon
                ? {
                    src: '/logo.png',
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }
                : undefined
            }
          />
        </div>
        {/* Medium screens (tablets) */}
        <div className="hidden sm:block lg:hidden">
          <QRCodeSVG
            value={url}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
            level="M"
            marginSize={2}
            imageSettings={
              includeIcon
                ? {
                    src: '/logo.png',
                    x: undefined,
                    y: undefined,
                    height: 32,
                    width: 32,
                    excavate: true,
                  }
                : undefined
            }
          />
        </div>
        {/* Large screens (TVs/large tablets) */}
        <div className="hidden lg:block">
          <QRCodeSVG
            value={url}
            size={256}
            bgColor={bgColor}
            fgColor={fgColor}
            level="M"
            marginSize={2}
            imageSettings={
              includeIcon
                ? {
                    src: '/logo.png',
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }
                : undefined
            }
          />
        </div>
      </div>
      <p className="text-[10px] sm:text-xs lg:text-sm text-gray-400 mt-1.5 sm:mt-2 text-center">Scan to join</p>
    </div>
  );
}

export default QRCodeDisplay;
