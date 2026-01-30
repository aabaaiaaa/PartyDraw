/**
 * DrawingCanvas - HTML5 canvas component for drawing on player devices
 *
 * Features:
 * - Touch and mouse input via unified pointer events
 * - Prevents page scroll while drawing (touch-action: none)
 * - Displays current question and timer
 * - Submit button to send drawing
 * - Shows confirmation after submission
 *
 * Note: Drawing controls (color, brush size, clear, eraser) will be added
 * in TASK-042 (DrawingControls component)
 */

import { useRef, useEffect, useCallback, useState } from 'react';

interface DrawingCanvasProps {
  question: string;
  timerSeconds: number | null;
  onSubmit: (drawingData: string) => void;
  hasSubmitted: boolean;
  /** Whether the drawing phase has ended (timer expired) - triggers auto-submit */
  drawingPhaseEnded?: boolean;
}

// Default drawing settings (will be controlled by DrawingControls in TASK-042)
const DEFAULT_STROKE_COLOR = '#000000';
const DEFAULT_STROKE_WIDTH = 4;

function DrawingCanvas({
  question,
  timerSeconds,
  onSubmit,
  hasSubmitted,
  drawingPhaseEnded = false,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * Get the canvas context with proper settings
   */
  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.strokeStyle = DEFAULT_STROKE_COLOR;
    ctx.lineWidth = DEFAULT_STROKE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    return ctx;
  }, []);

  /**
   * Convert pointer event coordinates to canvas coordinates
   */
  const getCanvasPoint = useCallback(
    (e: PointerEvent | React.PointerEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  /**
   * Handle pointer down - start drawing
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (hasSubmitted) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Capture the pointer to track it even if it leaves the canvas
      canvas.setPointerCapture(e.pointerId);

      const point = getCanvasPoint(e);
      lastPointRef.current = point;
      setIsDrawing(true);

      // Draw a dot for single taps/clicks
      const ctx = getContext();
      if (ctx) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, DEFAULT_STROKE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fillStyle = DEFAULT_STROKE_COLOR;
        ctx.fill();
        setHasDrawn(true);
      }
    },
    [hasSubmitted, getCanvasPoint, getContext]
  );

  /**
   * Handle pointer move - draw line
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing || hasSubmitted) return;

      const ctx = getContext();
      if (!ctx || !lastPointRef.current) return;

      const point = getCanvasPoint(e);

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      lastPointRef.current = point;
      setHasDrawn(true);
    },
    [isDrawing, hasSubmitted, getCanvasPoint, getContext]
  );

  /**
   * Handle pointer up - stop drawing
   */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.releasePointerCapture(e.pointerId);
      }
      setIsDrawing(false);
      lastPointRef.current = null;
    },
    []
  );

  /**
   * Handle pointer leave - stop drawing if pointer leaves canvas
   */
  const handlePointerLeave = useCallback(() => {
    setIsDrawing(false);
    lastPointRef.current = null;
  }, []);

  /**
   * Initialize canvas with white background
   */
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, 400); // Max 400px for reasonable drawing size
    canvas.width = size;
    canvas.height = size;

    // Fill with white background
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  /**
   * Clear the canvas
   */
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  }, []);

  /**
   * Capture canvas as base64 JPEG
   */
  const captureDrawing = useCallback((): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    // Export as JPEG with 0.8 quality for smaller file size
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  /**
   * Handle submit button click
   */
  const handleSubmit = useCallback(() => {
    const drawingData = captureDrawing();
    if (drawingData) {
      onSubmit(drawingData);
    }
  }, [captureDrawing, onSubmit]);

  // Initialize canvas on mount and window resize
  useEffect(() => {
    initCanvas();

    const handleResize = () => {
      // Store current drawing
      const canvas = canvasRef.current;
      if (!canvas) return;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Resize and restore
      initCanvas();

      const ctx = canvas.getContext('2d');
      if (ctx && tempCtx) {
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // Auto-submit when drawing phase ends (timer expired)
  useEffect(() => {
    if (drawingPhaseEnded && !hasSubmitted) {
      // Capture and submit the current canvas state automatically
      const drawingData = captureDrawing();
      if (drawingData) {
        console.log('[DrawingCanvas] Auto-submitting drawing on timer expiry');
        onSubmit(drawingData);
      }
    }
  }, [drawingPhaseEnded, hasSubmitted, captureDrawing, onSubmit]);

  // Show submitted state
  if (hasSubmitted) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-xl font-bold text-green-600 mb-2">
          Drawing Submitted!
        </h2>
        <p className="text-gray-600">Waiting for other players...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Question and Timer Header */}
      <div className="text-center mb-3">
        <h2 className="text-lg font-bold text-teal-800">Draw:</h2>
        <p className="text-xl font-semibold text-purple-600 mb-2">{question}</p>

        {/* Timer */}
        {timerSeconds !== null && (
          <div
            className={`text-2xl font-mono font-bold ${
              timerSeconds <= 5
                ? 'text-red-500 animate-pulse'
                : timerSeconds <= 10
                ? 'text-orange-500'
                : 'text-teal-600'
            }`}
          >
            {timerSeconds}s
          </div>
        )}
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center mb-3"
      >
        <canvas
          ref={canvasRef}
          className="border-2 border-teal-400 rounded-lg bg-white shadow-inner cursor-crosshair"
          style={{
            touchAction: 'none', // Prevent scroll while drawing
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerUp}
        />
      </div>

      {/* Controls - Clear and Submit */}
      <div className="flex gap-2">
        {/* Clear Button */}
        <button
          onClick={clearCanvas}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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
          onClick={handleSubmit}
          disabled={!hasDrawn}
          className={`flex-[2] font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 ${
            hasDrawn
              ? 'bg-teal-600 hover:bg-teal-700 text-white active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
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
          Submit Drawing
        </button>
      </div>

      {/* Help text */}
      <p className="text-center text-xs text-gray-500 mt-2">
        Draw with your finger or mouse
      </p>
    </div>
  );
}

export default DrawingCanvas;
