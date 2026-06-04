import React, { useRef, useState, useEffect } from 'react';

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
  const [isDrawing, setIsDrawing] = useState(false);
  const initialLoadedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent || parent.offsetWidth === 0) return;
      
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const newWidth = parent.offsetWidth * ratio;
      const newHeight = parent.offsetHeight * ratio;
      
      // Prevent unnecessary resizing
      if (canvas.width === newWidth && canvas.height === newHeight) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Save current drawing if there is one
      const dataUrl = canvas.toDataURL();
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.scale(ratio, ratio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0284c7'; // primary-600
      
      // Restore drawing
      if (!initialLoadedRef.current && initialSignature) {
        // Load initial signature on first setup
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, parent.offsetWidth, parent.offsetHeight);
          initialLoadedRef.current = true;
        };
        img.src = initialSignature;
      } else if (dataUrl && dataUrl !== 'data:,') {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, parent.offsetWidth, parent.offsetHeight);
        };
        img.src = dataUrl;
      }
    };

    const observer = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    // Trigger initial resize after a small delay to ensure DOM layout is settled (for animated modals)
    const timer = setTimeout(resizeCanvas, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type.includes('mouse') && (e as React.MouseEvent).button !== 0) return; // Only left click
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL('image/png'));
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
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
          className="w-full h-full cursor-crosshair relative z-10"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20 transition-opacity z-0">
          <span className="font-bold text-gray-400 select-none text-2xl tracking-widest uppercase">{isRTL ? 'وقع هنا' : 'SIGN HERE'}</span>
        </div>
      </div>
    </div>
  );
};
