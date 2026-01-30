import { useRef, useCallback, useState, useEffect, RefObject } from 'react';

/**
 * Configuration options for the canvas hook
 */
export interface UseCanvasOptions {
  /** Initial stroke color (default: '#000000') */
  initialColor?: string;
  /** Initial stroke width (default: 4) */
  initialSize?: number;
  /** Canvas background color (default: '#FFFFFF') */
  backgroundColor?: string;
  /** JPEG export quality 0-1 (default: 0.8) */
  exportQuality?: number;
  /** Whether drawing is disabled (default: false) */
  disabled?: boolean;
}

/**
 * Return type for the useCanvas hook
 */
export interface UseCanvasReturn {
  /** Ref to attach to the canvas element */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** Whether the user is currently drawing */
  isDrawing: boolean;
  /** Whether any strokes have been drawn */
  hasDrawn: boolean;
  /** Current stroke color */
  color: string;
  /** Current stroke width */
  size: number;
  /** Whether eraser mode is active */
  isEraser: boolean;
  /** Set the stroke color */
  setColor: (color: string) => void;
  /** Set the stroke width */
  setSize: (size: number) => void;
  /** Toggle eraser mode on/off */
  toggleEraser: () => void;
  /** Set eraser mode */
  setEraser: (enabled: boolean) => void;
  /** Clear the canvas to background color */
  clear: () => void;
  /** Export canvas as base64 JPEG data URL */
  captureDrawing: () => string;
  /** Initialize canvas with given dimensions */
  initCanvas: (width: number, height: number) => void;
  /** Pointer event handlers to attach to canvas */
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerLeave: () => void;
    onPointerCancel: (e: React.PointerEvent) => void;
  };
}

/**
 * React hook for managing HTML5 canvas drawing with touch and mouse support.
 *
 * Features:
 * - Unified pointer event handling for touch/mouse/pen
 * - Color and brush size state management
 * - Eraser mode support
 * - Clear canvas function
 * - Export to base64 JPEG
 *
 * @example
 * ```tsx
 * function DrawingComponent() {
 *   const {
 *     canvasRef,
 *     handlers,
 *     hasDrawn,
 *     color,
 *     setColor,
 *     clear,
 *     captureDrawing
 *   } = useCanvas({ initialColor: '#FF0000' });
 *
 *   return (
 *     <canvas
 *       ref={canvasRef}
 *       style={{ touchAction: 'none' }}
 *       {...handlers}
 *     />
 *   );
 * }
 * ```
 */
export function useCanvas(options: UseCanvasOptions = {}): UseCanvasReturn {
  const {
    initialColor = '#000000',
    initialSize = 4,
    backgroundColor = '#FFFFFF',
    exportQuality = 0.8,
    disabled = false,
  } = options;

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Stroke settings
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState(initialSize);
  const [isEraser, setIsEraser] = useState(false);

  /**
   * Get the canvas 2D rendering context
   */
  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Configure stroke settings
    ctx.strokeStyle = isEraser ? backgroundColor : color;
    ctx.lineWidth = isEraser ? size * 2 : size; // Eraser is larger
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    return ctx;
  }, [color, size, isEraser, backgroundColor]);

  /**
   * Convert pointer event coordinates to canvas coordinates
   */
  const getCanvasPoint = useCallback(
    (e: React.PointerEvent): { x: number; y: number } => {
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
      if (disabled) return;

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
        const dotSize = isEraser ? size : size / 2;
        ctx.arc(point.x, point.y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = isEraser ? backgroundColor : color;
        ctx.fill();
        setHasDrawn(true);
      }
    },
    [disabled, getCanvasPoint, getContext, color, size, isEraser, backgroundColor]
  );

  /**
   * Handle pointer move - draw line
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing || disabled) return;

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
    [isDrawing, disabled, getCanvasPoint, getContext]
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
   * Initialize canvas with white background at specified dimensions
   */
  const initCanvas = useCallback(
    (width: number, height: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = width;
      canvas.height = height;

      // Fill with background color
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      setHasDrawn(false);
    },
    [backgroundColor]
  );

  /**
   * Clear the canvas to background color
   */
  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  }, [backgroundColor]);

  /**
   * Capture canvas as base64 JPEG data URL
   */
  const captureDrawing = useCallback((): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    // Export as JPEG with configured quality for smaller file size
    return canvas.toDataURL('image/jpeg', exportQuality);
  }, [exportQuality]);

  /**
   * Toggle eraser mode
   */
  const toggleEraser = useCallback(() => {
    setIsEraser((prev) => !prev);
  }, []);

  /**
   * Set eraser mode on/off
   */
  const setEraserMode = useCallback((enabled: boolean) => {
    setIsEraser(enabled);
  }, []);

  // Reset eraser mode when color changes
  useEffect(() => {
    // When user picks a new color, turn off eraser
    setIsEraser(false);
  }, [color]);

  return {
    canvasRef,
    isDrawing,
    hasDrawn,
    color,
    size,
    isEraser,
    setColor,
    setSize,
    toggleEraser,
    setEraser: setEraserMode,
    clear,
    captureDrawing,
    initCanvas,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onPointerCancel: handlePointerUp,
    },
  };
}

export default useCanvas;
