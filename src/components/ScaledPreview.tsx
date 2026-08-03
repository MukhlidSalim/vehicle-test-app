import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

/**
 * ScaledPreview dynamically scales A4 preview documents to fit smaller container widths.
 * 
 * Uses useLayoutEffect to measure content height BEFORE the browser paints,
 * preventing Layout Shift that causes buttons below to jump and miss touch events on mobile.
 */
export const ScaledPreview: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [scale, setScale] = useState<number>(1);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate scale based on container width
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        const parentWidth = wrapperRef.current.offsetWidth;
        const a4WidthInPx = 793.7;
        const padding = 16;
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

  // Measure content height BEFORE paint (useLayoutEffect) to prevent Layout Shift.
  // This runs synchronously after DOM mutations but before the browser renders,
  // so the user never sees the wrong height.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const target = el.firstElementChild || el;
    const measured = Math.ceil(target.scrollHeight);
    setContentHeight(measured);
  }, [children]);

  // Continue observing for dynamic content changes after initial paint
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newHeight = Math.ceil(entry.target.scrollHeight);
        setContentHeight((prev) => prev === null || Math.abs(prev - newHeight) > 5 ? newHeight : prev);
      }
    });
    
    const innerWrapper = el.firstElementChild;
    if (innerWrapper) {
       resizeObserver.observe(innerWrapper);
    } else {
       resizeObserver.observe(el);
    }
    
    return () => resizeObserver.disconnect();
  }, [children]);

  // If not yet measured, use 'auto' to avoid guessing wrong
  const visualHeight = contentHeight !== null ? contentHeight * scale : undefined;

  return (
    <div 
      ref={wrapperRef} 
      className="w-full flex justify-center no-print" 
      style={{ 
        height: visualHeight !== undefined ? `${visualHeight}px` : 'auto', 
        marginBottom: scale < 1 ? '1rem' : '2.5rem',
        overflow: 'hidden'
      }}
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
