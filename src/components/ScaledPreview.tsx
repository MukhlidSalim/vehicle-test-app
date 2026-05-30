import React, { useState, useRef, useEffect } from 'react';

/**
 * ScaledPreview dynamically scales A4 preview documents to fit smaller container widths.
 * Automatically listens to window resize events.
 */
export const ScaledPreview: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [scale, setScale] = useState<number>(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        const parentWidth = wrapperRef.current.offsetWidth;
        const a4WidthInPx = 793.7; // Width of A4 in pixels at standard DPI
        const padding = 16; // Standard padding offset
        const availableWidth = parentWidth - padding;
        
        if (availableWidth < a4WidthInPx) {
          setScale(availableWidth / a4WidthInPx);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visualHeight = 297 * 3.78 * scale; // Visual height in px calculated based on A4 aspect ratio

  return (
    <div 
      ref={wrapperRef} 
      className="w-full flex justify-center no-print" 
      style={{ height: `${visualHeight}px`, marginBottom: scale < 1 ? '1rem' : '2.5rem' }}
    >
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          width: '210mm',
          height: '297mm'
        }}
        className="flex-shrink-0"
      >
        {children}
      </div>
    </div>
  );
};
