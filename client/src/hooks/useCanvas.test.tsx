import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from './useCanvas';
import React from 'react';

/**
 * Create a mock canvas element with a mocked context
 */
function createMockCanvas() {
  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  };

  const mockCanvas = {
    width: 400,
    height: 300,
    getContext: vi.fn(() => mockCtx),
    getBoundingClientRect: vi.fn(() => ({
      left: 0,
      top: 0,
      width: 400,
      height: 300,
    })),
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    toDataURL: vi.fn(() => 'data:image/jpeg;base64,mockImageData'),
  };

  return { mockCanvas, mockCtx };
}

/**
 * Create a mock pointer event
 */
function createPointerEvent(
  type: string,
  clientX: number,
  clientY: number,
  pointerId = 1
): React.PointerEvent {
  return {
    clientX,
    clientY,
    pointerId,
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as React.PointerEvent;
}

describe('useCanvas', () => {
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useCanvas());

      expect(result.current.color).toBe('#000000');
      expect(result.current.size).toBe(4);
      expect(result.current.isDrawing).toBe(false);
      expect(result.current.hasDrawn).toBe(false);
      expect(result.current.isEraser).toBe(false);
    });

    it('should initialize with custom options', () => {
      const { result } = renderHook(() =>
        useCanvas({
          initialColor: '#FF0000',
          initialSize: 8,
        })
      );

      expect(result.current.color).toBe('#FF0000');
      expect(result.current.size).toBe(8);
    });

    it('should provide a canvas ref', () => {
      const { result } = renderHook(() => useCanvas());

      expect(result.current.canvasRef).toBeDefined();
      expect(result.current.canvasRef.current).toBeNull();
    });

    it('should provide handler functions', () => {
      const { result } = renderHook(() => useCanvas());

      expect(typeof result.current.handlers.onPointerDown).toBe('function');
      expect(typeof result.current.handlers.onPointerMove).toBe('function');
      expect(typeof result.current.handlers.onPointerUp).toBe('function');
      expect(typeof result.current.handlers.onPointerLeave).toBe('function');
      expect(typeof result.current.handlers.onPointerCancel).toBe('function');
    });
  });

  describe('color changes', () => {
    it('should update color when setColor is called', () => {
      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.setColor('#00FF00');
      });

      expect(result.current.color).toBe('#00FF00');
    });

    it('should turn off eraser when color changes', () => {
      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.toggleEraser();
      });
      expect(result.current.isEraser).toBe(true);

      act(() => {
        result.current.setColor('#0000FF');
      });

      expect(result.current.isEraser).toBe(false);
      expect(result.current.color).toBe('#0000FF');
    });
  });

  describe('size changes', () => {
    it('should update size when setSize is called', () => {
      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.setSize(10);
      });

      expect(result.current.size).toBe(10);
    });

    it('should handle different brush sizes', () => {
      const { result } = renderHook(() => useCanvas({ initialSize: 2 }));

      expect(result.current.size).toBe(2);

      act(() => {
        result.current.setSize(20);
      });

      expect(result.current.size).toBe(20);
    });
  });

  describe('eraser mode', () => {
    it('should toggle eraser mode', () => {
      const { result } = renderHook(() => useCanvas());

      expect(result.current.isEraser).toBe(false);

      act(() => {
        result.current.toggleEraser();
      });

      expect(result.current.isEraser).toBe(true);

      act(() => {
        result.current.toggleEraser();
      });

      expect(result.current.isEraser).toBe(false);
    });

    it('should set eraser mode directly', () => {
      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.setEraser(true);
      });

      expect(result.current.isEraser).toBe(true);

      act(() => {
        result.current.setEraser(false);
      });

      expect(result.current.isEraser).toBe(false);
    });
  });

  describe('canvas initialization', () => {
    it('should initialize canvas with specified dimensions', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ backgroundColor: '#FFFFFF' }));

      // Attach mock canvas to ref
      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        result.current.initCanvas(800, 600);
      });

      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(600);
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(result.current.hasDrawn).toBe(false);
    });

    it('should fill with background color on init', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ backgroundColor: '#CCCCCC' }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        result.current.initCanvas(100, 100);
      });

      expect(mockCtx.fillStyle).toBe('#CCCCCC');
    });
  });

  describe('clear functionality', () => {
    it('should clear canvas to background color', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ backgroundColor: '#FFFFFF' }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        result.current.clear();
      });

      expect(mockCtx.fillStyle).toBe('#FFFFFF');
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 400, 300);
    });

    it('should reset hasDrawn to false after clear', () => {
      const { mockCanvas } = createMockCanvas();
      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      // Simulate drawing by calling pointer down
      act(() => {
        const event = createPointerEvent('pointerdown', 50, 50);
        result.current.handlers.onPointerDown(event);
      });

      expect(result.current.hasDrawn).toBe(true);

      act(() => {
        result.current.clear();
      });

      expect(result.current.hasDrawn).toBe(false);
    });

    it('should use custom background color when clearing', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ backgroundColor: '#FF00FF' }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        result.current.clear();
      });

      expect(mockCtx.fillStyle).toBe('#FF00FF');
    });

    it('should handle clear when no canvas attached', () => {
      const { result } = renderHook(() => useCanvas());

      // Should not throw
      act(() => {
        result.current.clear();
      });
    });
  });

  describe('captureDrawing', () => {
    it('should return base64 data URL', () => {
      const { mockCanvas } = createMockCanvas();
      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      let dataUrl: string;
      act(() => {
        dataUrl = result.current.captureDrawing();
      });

      expect(dataUrl!).toBe('data:image/jpeg;base64,mockImageData');
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    });

    it('should use custom export quality', () => {
      const { mockCanvas } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ exportQuality: 0.5 }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        result.current.captureDrawing();
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.5);
    });

    it('should return empty string when no canvas attached', () => {
      const { result } = renderHook(() => useCanvas());

      let dataUrl: string;
      act(() => {
        dataUrl = result.current.captureDrawing();
      });

      expect(dataUrl!).toBe('');
    });
  });

  describe('drawing strokes', () => {
    it('should start drawing on pointer down', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const event = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(event);
      });

      expect(result.current.isDrawing).toBe(true);
      expect(result.current.hasDrawn).toBe(true);
      expect(mockCanvas.setPointerCapture).toHaveBeenCalledWith(1);
    });

    it('should draw dot on pointer down', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ initialColor: '#FF0000' }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const event = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(event);
      });

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fillStyle).toBe('#FF0000');
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should draw line on pointer move while drawing', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const downEvent = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(downEvent);
      });

      mockCtx.beginPath.mockClear();
      mockCtx.moveTo.mockClear();
      mockCtx.lineTo.mockClear();
      mockCtx.stroke.mockClear();

      act(() => {
        const moveEvent = createPointerEvent('pointermove', 150, 150);
        result.current.handlers.onPointerMove(moveEvent);
      });

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalledWith(100, 100);
      expect(mockCtx.lineTo).toHaveBeenCalledWith(150, 150);
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should not draw when not in drawing mode', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const moveEvent = createPointerEvent('pointermove', 150, 150);
        result.current.handlers.onPointerMove(moveEvent);
      });

      expect(mockCtx.stroke).not.toHaveBeenCalled();
    });

    it('should stop drawing on pointer up', () => {
      const { mockCanvas } = createMockCanvas();
      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const downEvent = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(downEvent);
      });

      expect(result.current.isDrawing).toBe(true);

      act(() => {
        const upEvent = createPointerEvent('pointerup', 150, 150);
        result.current.handlers.onPointerUp(upEvent);
      });

      expect(result.current.isDrawing).toBe(false);
      expect(mockCanvas.releasePointerCapture).toHaveBeenCalledWith(1);
    });

    it('should stop drawing on pointer leave', () => {
      const { mockCanvas } = createMockCanvas();
      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const downEvent = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(downEvent);
      });

      expect(result.current.isDrawing).toBe(true);

      act(() => {
        result.current.handlers.onPointerLeave();
      });

      expect(result.current.isDrawing).toBe(false);
    });
  });

  describe('stroke settings', () => {
    it('should apply color to strokes', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ initialColor: '#00FF00' }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const event = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(event);
      });

      expect(mockCtx.strokeStyle).toBe('#00FF00');
    });

    it('should apply size to strokes', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ initialSize: 12 }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const event = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(event);
      });

      expect(mockCtx.lineWidth).toBe(12);
    });

    it('should use background color for eraser', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() =>
        useCanvas({
          initialColor: '#FF0000',
          backgroundColor: '#FFFFFF',
        })
      );

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        result.current.setEraser(true);
      });

      act(() => {
        const event = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(event);
      });

      expect(mockCtx.strokeStyle).toBe('#FFFFFF');
    });

    it('should double line width for eraser', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ initialSize: 8 }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        result.current.setEraser(true);
      });

      act(() => {
        const event = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(event);
      });

      expect(mockCtx.lineWidth).toBe(16); // doubled for eraser
    });

    it('should set line cap to round', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const event = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(event);
      });

      expect(mockCtx.lineCap).toBe('round');
    });

    it('should set line join to round', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const event = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(event);
      });

      expect(mockCtx.lineJoin).toBe('round');
    });
  });

  describe('disabled state', () => {
    it('should not draw when disabled', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ disabled: true }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const event = createPointerEvent('pointerdown', 100, 100);
        result.current.handlers.onPointerDown(event);
      });

      expect(result.current.isDrawing).toBe(false);
      expect(result.current.hasDrawn).toBe(false);
      expect(mockCanvas.setPointerCapture).not.toHaveBeenCalled();
    });

    it('should not draw stroke when disabled during move', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      const { result } = renderHook(() => useCanvas({ disabled: true }));

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        const moveEvent = createPointerEvent('pointermove', 150, 150);
        result.current.handlers.onPointerMove(moveEvent);
      });

      expect(mockCtx.stroke).not.toHaveBeenCalled();
    });
  });

  describe('coordinate conversion', () => {
    it('should handle scaled canvas correctly', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      // Set canvas to 400x300 pixels but displayed at 200x150
      mockCanvas.width = 400;
      mockCanvas.height = 300;
      mockCanvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 200,
        height: 150,
      }));

      const { result } = renderHook(() => useCanvas());

      (result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        mockCanvas as unknown as HTMLCanvasElement;

      act(() => {
        // Click at display coordinate (50, 50) which is canvas coordinate (100, 100)
        const event = createPointerEvent('pointerdown', 50, 50);
        result.current.handlers.onPointerDown(event);
      });

      // The arc should be drawn at canvas coordinates (100, 100)
      expect(mockCtx.arc).toHaveBeenCalledWith(100, 100, expect.any(Number), 0, Math.PI * 2);
    });
  });
});
