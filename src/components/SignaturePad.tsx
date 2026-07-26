import React, { useRef, useState, useEffect } from 'react';
import { getStroke } from 'perfect-freehand';

// Helper to generate SVG path from the points returned by perfect-freehand
function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );
  d.push('Z');
  return d.join(' ');
}

interface SignaturePadProps {
  onSave: (signatureBase64: string) => void;
  onClear: () => void;
  label: string;
  isRTL?: boolean;
  initialSignature?: string;
  error?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear, label, isRTL, initialSignature, error }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Store strokes in refs to avoid React re-renders on every mouse move
  const strokesRef = useRef<number[][][]>([]);
  const currentStrokeRef = useRef<number[][]>([]);
  const isDrawingRef = useRef(false);
  const initialLoadedRef = useRef(false);
  const savedImageRef = useRef<HTMLImageElement | null>(null);

  // Custom Pen Cursor SVG
  const penCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%230284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>') 0 24, crosshair`;

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We must reset the transform to clear the entire physical canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    ctx.scale(ratio, ratio);

    // Draw initial signature if no new strokes exist
    if (initialSignature && strokesRef.current.length === 0 && currentStrokeRef.current.length === 0) {
      if (savedImageRef.current) {
        ctx.drawImage(savedImageRef.current, 0, 0, canvas.width / ratio, canvas.height / ratio);
      }
    }

    ctx.fillStyle = '#0284c7'; // primary-600

    const allStrokes = [...strokesRef.current];
    if (currentStrokeRef.current.length > 0) {
      allStrokes.push(currentStrokeRef.current);
    }

    for (const points of allStrokes) {
      // Configure perfect-freehand options for a fountain pen feel
      const strokeOutline = getStroke(points, {
        size: 8,
        thinning: 0.6,
        smoothing: 0.5,
        streamline: 0.5,
        simulatePressure: true,
      });
      const pathData = getSvgPathFromStroke(strokeOutline as number[][]);
      const path = new Path2D(pathData);
      ctx.fill(path);
    }
  };

  useEffect(() => {
    // Preload initial signature image if available
    if (initialSignature && !initialLoadedRef.current) {
      const img = new Image();
      img.onload = () => {
        savedImageRef.current = img;
        initialLoadedRef.current = true;
        redraw();
      };
      img.src = initialSignature;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent || parent.offsetWidth === 0) return;
      
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const newWidth = parent.offsetWidth * ratio;
      const newHeight = parent.offsetHeight * ratio;
      
      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        redraw();
      }
    };

    const observer = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    const timer = setTimeout(resizeCanvas, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [initialSignature]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: e.pressure || 0.5 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure !== 0 ? e.pressure : 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return; // Only left click
    const canvas = canvasRef.current;
    if (canvas) canvas.setPointerCapture(e.pointerId);

    isDrawingRef.current = true;
    const { x, y, pressure } = getCoordinates(e);
    currentStrokeRef.current = [[x, y, pressure]];
    redraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const { x, y, pressure } = getCoordinates(e);
    currentStrokeRef.current.push([x, y, pressure]);
    redraw();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    
    const canvas = canvasRef.current;
    if (canvas) canvas.releasePointerCapture(e.pointerId);

    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }
    
    // Save to parent component
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    savedImageRef.current = null;
    initialLoadedRef.current = false;
    redraw();
    onClear();
  };

  return (
    <div className="flex flex-col gap-2 w-full" data-error={error ? "true" : "false"}>
      <div className="flex justify-between items-center px-1">
        <label className="text-sm font-black text-gray-700">{label}</label>
        <button type="button" onClick={handleClear} className="text-[11px] bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold hover:bg-red-100 transition-colors active:scale-95">
          {isRTL ? 'مسح' : 'Clear'}
        </button>
      </div>
      <div 
        className={`relative w-full h-40 bg-gray-50/50 rounded-xl border-2 transition-colors overflow-hidden touch-none group ${
          error ? 'border-red-500 shadow-sm shadow-red-100' : 'border-dashed border-gray-300 hover:border-primary-400 focus-within:border-primary-500 focus-within:bg-white'
        }`}
      >
        <canvas
          ref={canvasRef}
          style={{ cursor: penCursor }}
          className="w-full h-full relative z-10"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20 transition-opacity z-0">
          <span className="font-bold text-gray-400 select-none text-2xl tracking-widest uppercase">{isRTL ? 'التوقيع' : 'SIGNATURE'}</span>
        </div>
      </div>
    </div>
  );
};

