import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, X, Check } from 'lucide-react';
import { DamagePoint, VehicleType } from '../types';
import { VEHICLE_IMAGES } from '../constants';

interface VehicleBodyMapProps {
  points?: DamagePoint[];
  onAddPoint?: (point: { x: number; y: number }) => void;
  onSelectPoint?: (idx: number) => void;
  selectedIndex?: number | null;
  readOnly?: boolean;
  type?: VehicleType;
  compact?: boolean;
  isRTL?: boolean;
}

/**
 * VehicleBodyMap displays a 2D vehicle silhouette map where damage points can be marked.
 * Supports panning, zooming, and expansion for high-precision marking on mobile screens.
 */
export const VehicleBodyMap: React.FC<VehicleBodyMapProps> = ({
  points = [],
  onAddPoint,
  onSelectPoint,
  selectedIndex = null,
  readOnly = false,
  type = 'light_vehicle',
  compact = false,
  isRTL = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageUrl = VEHICLE_IMAGES[type as keyof typeof VEHICLE_IMAGES];

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    if (mapRef.current) mapRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || zoom <= 1) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setOffset({ x: newX, y: newY });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !onAddPoint || !mapRef.current) return;
    if (window.innerWidth < 768 && !isExpanded) {
      setIsExpanded(true);
      return;
    }
    if (isDragging && zoom > 1) return;

    const rect = mapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const x = (clickX / rect.width) * 100;
    const y = (clickY / rect.height) * 100;

    onAddPoint({ x, y });
  };

  const Marker = ({ p, idx }: { p: DamagePoint; idx: number }) => {
    const isSelected = typeof selectedIndex === 'number' && selectedIndex === idx;
    const baseCls = `absolute w-6 h-6 rounded-full border border-white shadow transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[11px] text-white font-black z-[60] ${
      readOnly ? 'pointer-events-none' : 'pointer-events-auto'
    } ${isSelected ? 'ring-4 ring-white/90 scale-110' : ''}`;
    const style = { left: `${p.x}%`, top: `${p.y}%` };

    if (!readOnly && onSelectPoint) {
      return (
        <button
          key={idx}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelectPoint(idx);
          }}
          className={`${baseCls} bg-amber-500`}
          style={style}
          aria-label={isRTL ? `تحديد ضرر رقم ${idx + 1}` : `Select damage ${idx + 1}`}
        >
          {idx + 1}
        </button>
      );
    }

    return (
      <div key={idx} className={`${baseCls} bg-amber-500`} style={style}>
        {idx + 1}
      </div>
    );
  };

  const renderMarkers = () => (points || []).map((p, idx) => (
    <Marker key={idx} p={p} idx={idx} />
  ));

  return (
    <div className="flex flex-col gap-3 w-full">
      {!readOnly && (
        <div className="flex justify-between items-center px-1 no-print">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {isRTL ? 'اضغط لتحديد الضرر' : 'Tap to mark damage'}
            </span>
          </div>
          <button
            onClick={() => {
              setIsExpanded(true);
              resetView();
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black hover:bg-primary-600 hover:text-white transition-all shadow-sm"
          >
            <Maximize2 size={14} />
            <span className="v-center-cairo">{isRTL ? 'توسيع وتحكم ذكي' : 'Expand & Smart Control'}</span>
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 border-gray-400 shadow-sm group ${
          compact ? 'max-h-[180px]' : ''
        }`}
        style={{ aspectRatio: '2.8 / 1' }}
      >
        <div
          ref={!isExpanded ? mapRef : null}
          className="relative w-full h-full flex items-center justify-center cursor-crosshair touch-none"
          onClick={!isExpanded ? handleClick : undefined}
        >
          <img
            src={imageUrl}
            alt="Vehicle Map"
            className="w-full h-full object-contain pointer-events-none"
            crossOrigin="anonymous"
          />
          {!isExpanded && renderMarkers()}
        </div>
      </div>

      {isExpanded && !readOnly && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col p-4 md:p-8 no-print animate-fade-in overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div className="flex flex-col">
              <h3 className="text-white text-lg font-black v-center-cairo justify-start">
                {isRTL ? 'تحديد الضرر بدقة' : 'Precision Mark'}
              </h3>
              <p className="text-gray-400 text-xs font-bold">
                {isRTL ? 'كبر وحرك الصورة لتحديد المكان بدقة' : 'Zoom & Pan for accurate marking'}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-3 bg-white/10 text-white rounded-2xl hover:bg-red-600 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute top-4 right-4 z-[210] flex flex-col gap-2 no-print">
              <button 
                onClick={handleZoomIn} 
                className="p-3 bg-white text-primary-900 rounded-xl shadow-xl active:scale-90 transition-transform"
              >
                <ZoomIn size={24} />
              </button>
              <button 
                onClick={handleZoomOut} 
                className="p-3 bg-white text-primary-900 rounded-xl shadow-xl active:scale-90 transition-transform"
              >
                <ZoomOut size={24} />
              </button>
              <button 
                onClick={resetView} 
                className="p-3 bg-white text-primary-900 rounded-xl shadow-xl active:scale-90 transition-transform"
              >
                <RotateCcw size={24} />
              </button>
            </div>

            <div className="absolute top-4 left-4 z-[210] px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-black shadow-lg">
              {Math.round(zoom * 100)}%
            </div>

            <div
              className="w-full h-full flex items-center justify-center overflow-hidden cursor-move touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <div
                ref={mapRef}
                className="relative bg-white rounded-xl shadow-2xl transition-transform duration-75 ease-out"
                style={{
                  width: '90%',
                  aspectRatio: '2.8/1',
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  cursor: isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'crosshair'),
                  touchAction: 'none'
                }}
                onClick={handleClick}
              >
                <img 
                  src={imageUrl} 
                  alt="Vehicle Map" 
                  className="w-full h-full object-contain pointer-events-none select-none" 
                  crossOrigin="anonymous" 
                />
                {renderMarkers()}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-3 shrink-0">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full py-4 rounded-2xl bg-primary-600 text-white font-black text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check size={24} />
              <span className="v-center-cairo">{isRTL ? 'تم، العودة للفحص' : 'Done, Back'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
