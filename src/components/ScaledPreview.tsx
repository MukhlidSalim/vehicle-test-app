import React, { useState, useRef, useEffect } from 'react';

/**
 * ScaledPreview dynamically scales A4 preview documents to fit smaller container widths.
 * Automatically listens to window resize events.
 */
export const ScaledPreview: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [scale, setScale] = useState<number>(1);
  const [contentHeight, setContentHeight] = useState<number>(1122.5); // Default to approx 297mm in px
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    
    // Measure actual height of the inner content wrapper
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContentHeight(entry.target.scrollHeight);
      }
    });
    
    // Check inner children since the outer div scales
    const innerWrapper = el.firstElementChild;
    if (innerWrapper) {
       resizeObserver.observe(innerWrapper);
    } else {
       resizeObserver.observe(el);
    }
    
    return () => resizeObserver.disconnect();
  }, [children]);

  const visualHeight = contentHeight * scale;

  return (
    <div 
      ref={wrapperRef} 
      className="w-full flex justify-center no-print" 
      style={{ height: `${visualHeight}px`, marginBottom: scale < 1 ? '1rem' : '2.5rem' }}
    >
      <div 
        ref={contentRef}
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          width: '210mm',
          minHeight: '297mm',
          height: 'fit-content'
        }}
        className="flex-shrink-0"
      >
        {children}
      </div>
    </div>
  );
};
