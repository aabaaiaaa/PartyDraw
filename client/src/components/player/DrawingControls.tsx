/**
 * DrawingControls - UI controls for the drawing canvas
 *
 * Features:
 * - Color palette with 8 vibrant colors
 * - Brush size selector (3 sizes: small, medium, large)
 * - Eraser toggle button
 * - Clear canvas button
 * - Submit drawing button
 *
 * This component is designed to work with the useCanvas hook
 * and DrawingCanvas component.
 */

interface DrawingControlsProps {
  /** Current selected color */
  color: string;
  /** Set the drawing color */
  setColor: (color: string) => void;
  /** Current brush size */
  size: number;
  /** Set the brush size */
  setSize: (size: number) => void;
  /** Whether eraser mode is active */
  isEraser: boolean;
  /** Toggle eraser mode */
  toggleEraser: () => void;
  /** Clear the canvas */
  onClear: () => void;
  /** Submit the drawing */
  onSubmit: () => void;
  /** Whether the submit button should be enabled */
  canSubmit: boolean;
  /** Whether controls are disabled (e.g., after submission) */
  disabled?: boolean;
}

// 8 vibrant drawing colors matching the party theme
const COLOR_PALETTE = [
  '#000000', // Black (default)
  '#ef4444', // Red
  '#f97316', // Orange
  '#facc15', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
];

// Brush size options
const BRUSH_SIZES = [
  { value: 2, label: 'S', displaySize: 8 },
  { value: 6, label: 'M', displaySize: 14 },
  { value: 12, label: 'L', displaySize: 22 },
];

function DrawingControls({
  color,
  setColor,
  size,
  setSize,
  isEraser,
  toggleEraser,
  onClear,
  onSubmit,
  canSubmit,
  disabled = false,
}: DrawingControlsProps) {
  return (
    <div className="space-y-3">
      {/* Color Palette */}
      <div className="flex justify-center gap-2 flex-wrap">
        {COLOR_PALETTE.map((paletteColor) => (
          <button
            key={paletteColor}
            onClick={() => setColor(paletteColor)}
            disabled={disabled}
            className={`w-9 h-9 rounded-full border-2 transition-all ${
              color === paletteColor && !isEraser
                ? 'border-white scale-110 shadow-lg'
                : 'border-gray-300 hover:scale-105'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ backgroundColor: paletteColor }}
            aria-label={`Select ${paletteColor} color`}
            title={paletteColor}
          />
        ))}
      </div>

      {/* Brush Size Selector and Eraser */}
      <div className="flex justify-center items-center gap-3">
        {/* Brush Sizes */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {BRUSH_SIZES.map((brushSize) => (
            <button
              key={brushSize.value}
              onClick={() => setSize(brushSize.value)}
              disabled={disabled}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                size === brushSize.value && !isEraser
                  ? 'bg-teal-500 text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={`${brushSize.label} brush size`}
              title={`${brushSize.label} brush`}
            >
              <span
                className="rounded-full bg-current"
                style={{
                  width: brushSize.displaySize,
                  height: brushSize.displaySize,
                }}
              />
            </button>
          ))}
        </div>

        {/* Eraser Toggle */}
        <button
          onClick={toggleEraser}
          disabled={disabled}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            isEraser
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isEraser ? 'Eraser active' : 'Toggle eraser'}
          title="Eraser"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
            />
            {/* Eraser icon path */}
            <rect
              x="3"
              y="11"
              width="18"
              height="6"
              rx="1"
              stroke="currentColor"
              strokeWidth={2}
              fill="none"
              transform="rotate(-45 12 12)"
            />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Clear Button */}
        <button
          onClick={onClear}
          disabled={disabled}
          className={`flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Clear canvas"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear
        </button>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit || disabled}
          className={`flex-[2] font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 ${
            canSubmit && !disabled
              ? 'bg-teal-600 hover:bg-teal-700 text-white active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          aria-label="Submit drawing"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Submit
        </button>
      </div>
    </div>
  );
}

export default DrawingControls;
