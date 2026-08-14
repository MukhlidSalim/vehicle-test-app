import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import React from 'react';
import { Language } from '../types';

/**
 * Converts an image URL to a Base64 string to prevent CORS issues when capturing HTML.
 */
export const convertImageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Crucial for strict CORS policies
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(url);
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        // Fallback to original URL if drawing/conversion fails
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    // Add cache breaker
    img.src = url + (url.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
  });
};

/**
 * Captures a DOM node as a JPEG data URL.
 * Automatically handles converting child image tags to base64 prior to capture.
 */
export const captureNode = async (node: HTMLElement): Promise<{ dataUrl: string; incomplete: boolean }> => {
  let hadIncomplete = false;
  const restoreMap: Map<HTMLImageElement, string> = new Map();

  // 1. Gather all image elements in the node
  const imgs = Array.from(node.querySelectorAll<HTMLImageElement>('img'));

  // 2. Convert all image sources to Base64 in parallel before capturing
  const processImages = async () => {
    const promises = imgs.map(async (img) => {
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith('data:')) return;

      try {
        restoreMap.set(img, src);

        // Fetch as blob first (tends to be more stable than direct canvas draw)
        const response = await fetch(src, { cache: 'no-cache', mode: 'cors' });
        const blob = await response.blob();

        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        img.src = base64;
      } catch (err) {
        console.warn('Failed to convert image to base64, leaving original:', src);
        hadIncomplete = true;
      }
    });

    await Promise.all(promises);
  };

  await processImages();

  // Ensure all fonts (Cairo, Inter) are fully loaded before capturing.
  // On desktop this resolves instantly; on mobile it waits if fonts are still loading.
  await document.fonts.ready;

  // Short timeout to guarantee DOM is updated with base64 sources
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    // 3. Render the node to JPEG
    const dataUrl = await toJpeg(node, {
      quality: 0.95,
      // Fixed at 2× for consistent high-quality output on all devices.
      // Using window.devicePixelRatio caused desktop (1×) to produce
      // lower-resolution images than mobile (2-3×).
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipAutoScale: true,
      style: {
        margin: '0',
        background: '#ffffff',
      },
    } as any);

    return { dataUrl, incomplete: hadIncomplete };
  } catch (error) {
    console.error('Capture failed', error);
    throw error;
  } finally {
    // 4. Cleanup and restore original image paths
    restoreMap.forEach((originalSrc, imgElement) => {
      imgElement.src = originalSrc;
    });
  }
};

interface GeneratePdfParams {
  nodes: NodeListOf<Element>;
  baseFilename: string;
  isRTL: boolean;
  lang: Language;
  shouldShare: boolean;
  onProgress: (progress: {
    percent: number;
    current: number;
    total: number;
    etaSec: number | null;
    phase: string;
  }) => void;
  onAttempt: (attempt: number) => void;
  onSuccess: (file: File, hadIncomplete: boolean) => void;
  onDownloadDirect: (pdf: jsPDF, filename: string) => void;
  onError: (err: any) => void;
}

/**
 * Handles the multi-page PDF generation flow, including the iOS warm-up render.
 */
export const generatePdfReport = async ({
  nodes,
  baseFilename,
  isRTL,
  lang,
  shouldShare,
  onProgress,
  onAttempt,
  onSuccess,
  onDownloadDirect,
  onError,
}: GeneratePdfParams): Promise<void> => {
  if (!nodes || nodes.length === 0) return;

  const totalPages = nodes.length;
  const startedAt = Date.now();

  const renderPdfOnce = async (forcePartial: boolean) => {
    const pdf = new jsPDF('p', 'mm', 'a4', true);
    let hadIncompleteCapture = false;

    for (let i = 0; i < totalPages; i++) {
      const pageStart = Date.now();

      onProgress({
        percent: totalPages > 0 ? Math.round((i / totalPages) * 100) : 0,
        current: i,
        total: totalPages,
        etaSec: null,
        phase: isRTL ? `تصوير الصفحة ${i + 1} من ${totalPages}` : `Capturing page ${i + 1} of ${totalPages}`,
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        const { dataUrl, incomplete } = await captureNode(nodes[i] as HTMLElement);
        if (incomplete) hadIncompleteCapture = true;

        if (i > 0) pdf.addPage();

        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        const pageHeight = pdf.internal.pageSize.getHeight();
        let position = 0;
        let remainingHeight = pdfHeight;

        while (remainingHeight > 5) { // 5mm threshold to avoid blank pages for tiny overflows
          pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
          remainingHeight -= pageHeight;
          position -= pageHeight;
          
          if (remainingHeight > 5) {
            pdf.addPage();
          }
        }
      } catch (e) {
        hadIncompleteCapture = true;

        if (!forcePartial) throw e;

        // Render fallback placeholder page
        if (i > 0) pdf.addPage();
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text(isRTL ? 'تعذّر التقاط هذه الصفحة بالكامل.' : 'This page could not be captured fully.', 18, 40);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text(
          isRTL ? `الصفحة: ${i + 1}/${totalPages}` : `Page: ${i + 1}/${totalPages}`,
          18,
          52
        );
        pdf.setFontSize(10);
        pdf.text(
          isRTL ? 'جرّب إعادة إنشاء التقرير لاحقًا عند توفر اتصال أفضل.' : 'Try generating the report again later with a better connection.',
          18,
          62
        );
      } finally {
        const processed = i + 1;
        const elapsed = Date.now() - startedAt;
        const avg = processed > 0 ? elapsed / processed : 0;
        const remainingMs = Math.max(0, Math.round(avg * (totalPages - processed)));
        
        onProgress({
          percent: totalPages > 0 ? Math.round((processed / totalPages) * 100) : 100,
          current: processed,
          total: totalPages,
          etaSec: remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0,
          phase: isRTL ? `معالجة الصفحة ${processed}` : `Processed page ${processed}`,
        });

        const pageElapsed = Date.now() - pageStart;
        if (pageElapsed < 80) await new Promise((r) => setTimeout(r, 80 - pageElapsed));
      }
    }

    return { pdf, hadIncompleteCapture };
  };

  try {
    // === Warm-up Capture for iOS/Safari WebKit ===
    onAttempt(1);
    onProgress({
      percent: 0,
      current: 0,
      total: totalPages,
      etaSec: null,
      phase: isRTL ? 'تهيئة سريعة للصور...' : 'Warming up images...',
    });

    try {
      await renderPdfOnce(true); // Silent run to prime image cache
    } catch {
      // Keep going, warm up failure should not block the main run
    }

    // Adaptive pause: mobile devices need extra time for fonts and layout paint
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    await new Promise((r) => setTimeout(r, isMobile ? 600 : 300));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    // === Main Capture ===
    onAttempt(2);
    onProgress({
      percent: 0,
      current: 0,
      total: totalPages,
      etaSec: null,
      phase: isRTL ? 'بدء إنشاء التقرير...' : 'Starting report generation...',
    });

    const { pdf, hadIncompleteCapture } = await renderPdfOnce(true);

    if (shouldShare) {
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${baseFilename}.pdf`, { type: 'application/pdf' });
      onSuccess(file, hadIncompleteCapture);
    } else {
      onDownloadDirect(pdf, `${baseFilename}.pdf`);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    onError(error);
  }
};

export interface GenerateSmartPdfParams {
  containerRef: React.RefObject<HTMLDivElement>;
  baseFilename: string;
  isRTL: boolean;
  lang: Language;
  shouldShare: boolean;
  onProgress?: (progress: { phase: string }) => void;
  onSuccess: (file: File) => void;
  onDownloadDirect: (pdf: jsPDF, filename: string) => void;
  onError: (err: any) => void;
}

/**
 * Smart PDF Generator (Two-Tier Boundary Algorithm).
 * Captures the entire container as one giant canvas, then intelligently slices it into A4 pages.
 * It auto-detects major boundaries (sections, cards) and minor boundaries (table rows) to prevent
 * splitting logical blocks across pages. Adapts to giant sections automatically.
 */
export const generateSmartPdf = async ({
  containerRef,
  baseFilename,
  isRTL,
  lang,
  shouldShare,
  onProgress,
  onSuccess,
  onDownloadDirect,
  onError,
}: GenerateSmartPdfParams): Promise<void> => {
  if (!containerRef.current) return;
  const container = containerRef.current;

  try {
    onProgress?.({ phase: isRTL ? 'تهيئة سريعة للصور...' : 'Warming up images...' });

    // === Warm-up Capture for iOS/Safari WebKit ===
    try {
      await captureNode(container);
    } catch {
      // Ignore warm-up errors
    }

    // Adaptive pause for mobile
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    await new Promise((r) => setTimeout(r, isMobile ? 600 : 300));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    onProgress?.({ phase: isRTL ? 'جاري تجهيز بيانات التقرير...' : 'Capturing report data...' });

    // 1. Capture the entire container as one giant canvas
    const { dataUrl } = await captureNode(container);

    // 2. We need the original image dimensions to map DOM coordinates to image pixels
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const sourceWidth = img.width;
    const sourceHeight = img.height;

    // We assume pixelRatio = 2 (as hardcoded in captureNode)
    const pixelRatio = 2;

    // 3. Find Boundaries in DOM (Auto-Detection)
    const containerRect = container.getBoundingClientRect();

    const getBoundaries = (selector: string) => {
      const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          top: (rect.top - containerRect.top) * pixelRatio,
          bottom: (rect.bottom - containerRect.top) * pixelRatio,
          height: rect.height * pixelRatio
        };
      });
    };

    // Major Boundaries: large containers, sections, explicit blocks
    const majorBoundaries = getBoundaries('.pdf-keep-together, section, article, .rounded-xl, .rounded-2xl, .rounded-lg, .shadow-sm, .border');

    // Minor Boundaries: table rows, list items
    const minorBoundaries = getBoundaries('tr, li, .border-b, .border-t, .divide-y > *');

    // 4. Initialize jsPDF
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const a4W_mm = pdf.internal.pageSize.getWidth();
    const a4H_mm = pdf.internal.pageSize.getHeight();

    // Max height in source pixels that fits exactly on one A4 page
    const maxSliceHeightPx = Math.floor((a4H_mm / a4W_mm) * sourceWidth);

    let currentSourceY = 0;

    // Temporary canvas for cropping
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = sourceWidth;
    // We do NOT set height here, we set it dynamically per slice!
    const ctx = cropCanvas.getContext('2d');

    if (!ctx) throw new Error("Could not create canvas context");

    onProgress?.({ phase: isRTL ? 'جاري التجميع الذكي للصفحات...' : 'Assembling smart pages...' });

    while (currentSourceY < sourceHeight) {
      let sliceHeight = maxSliceHeightPx;

      // If we are not on the very last slice
      if (currentSourceY + sliceHeight < sourceHeight) {
        const sliceBottom = currentSourceY + sliceHeight;

        // Check if slice cuts through a major boundary
        const intersectingMajor = majorBoundaries.find(b => b.top < sliceBottom && b.bottom > sliceBottom);

        if (intersectingMajor) {
          if (intersectingMajor.height < maxSliceHeightPx) {
            // It's a small section, push it entirely to next page
            // But only if we actually made progress on this page (don't infinitely loop)
            if (intersectingMajor.top > currentSourceY + 50) {
              sliceHeight = intersectingMajor.top - currentSourceY;
            }
          } else {
            // It's a GIANT section. Must cut inside it. Let's look for a minor boundary.
            const intersectingMinor = minorBoundaries.find(b => b.top < sliceBottom && b.bottom > sliceBottom);
            if (intersectingMinor && intersectingMinor.top > currentSourceY + 50) {
               // Cut cleanly above the minor row
               sliceHeight = intersectingMinor.top - currentSourceY;
            }
          }
        } else {
           // Didn't cut a major boundary, but might cut a minor one directly
           const intersectingMinor = minorBoundaries.find(b => b.top < sliceBottom && b.bottom > sliceBottom);
           if (intersectingMinor && intersectingMinor.top > currentSourceY + 50) {
               sliceHeight = intersectingMinor.top - currentSourceY;
           }
        }
      }

      // Ensure we don't exceed remaining height
      sliceHeight = Math.min(sliceHeight, sourceHeight - currentSourceY);

      // Failsafe: Ensure sliceHeight is strictly positive to prevent infinite loops!
      if (isNaN(sliceHeight) || sliceHeight <= 0) {
        console.warn("Failsafe triggered: sliceHeight is zero or NaN. Forcing progress.");
        sliceHeight = maxSliceHeightPx > 0 ? maxSliceHeightPx : 100;
        // If it's still <= 0 (e.g. maxSliceHeightPx is 0), force a positive increment
        if (sliceHeight <= 0) sliceHeight = 100;
      }

      // If the remaining slice is extremely small (e.g. 1-2 pixels of border/white space), ignore it to prevent a blank extra page.
      if (sliceHeight < 5 && currentSourceY > 0) {
        break;
      }

      // Dynamically resize canvas to prevent stretching!
      cropCanvas.height = sliceHeight;

      // Draw slice
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
      ctx.drawImage(
        img,
        0, currentSourceY, sourceWidth, sliceHeight, // Source crop
        0, 0, sourceWidth, sliceHeight               // Destination
      );

      const croppedDataUrl = cropCanvas.toDataURL('image/jpeg', 0.95);

      if (currentSourceY > 0) pdf.addPage();

      // The height in mm of this specific slice on the A4 page
      let sliceHeight_mm = (sliceHeight / sourceWidth) * a4W_mm;
      if (isNaN(sliceHeight_mm) || sliceHeight_mm <= 0) {
        sliceHeight_mm = a4H_mm;
      }
      
      pdf.addImage(croppedDataUrl, 'JPEG', 0, 0, a4W_mm, sliceHeight_mm, undefined, 'FAST');

      currentSourceY += sliceHeight;
    }

    // 5. Append Footer to the VERY BOTTOM of the LAST PAGE
    try {
      const footerCanvas = document.createElement('canvas');
      // Scale canvas for retina quality
      const scale = 2;
      footerCanvas.width = sourceWidth * scale;
      footerCanvas.height = 60 * scale; 
      const fCtx = footerCanvas.getContext('2d');
      if (fCtx) {
        fCtx.scale(scale, scale);
        fCtx.fillStyle = '#ffffff';
        fCtx.fillRect(0, 0, sourceWidth, 60);
        
        fCtx.fillStyle = '#9ca3af'; // Tailwind gray-400
        fCtx.font = 'bold 12px Cairo, sans-serif';
        fCtx.textAlign = 'center';
        fCtx.textBaseline = 'middle';
        fCtx.direction = isRTL ? 'rtl' : 'ltr';
        
        const footerText = isRTL 
          ? 'تم إنشاء هذا التقرير إلكترونياً بواسطة نظام فحص المركبات (VIS)' 
          : 'This report was generated electronically by the Vehicle Inspection System (VIS)';
          
        fCtx.fillText(footerText, sourceWidth / 2, 30);
        
        const footerDataUrl = footerCanvas.toDataURL('image/jpeg', 1.0);
        const footerHeight_mm = (60 / sourceWidth) * a4W_mm;
        
        // Draw exactly at the bottom of the page (with 5mm margin from the absolute edge)
        pdf.addImage(footerDataUrl, 'JPEG', 0, a4H_mm - footerHeight_mm - 5, a4W_mm, footerHeight_mm, undefined, 'FAST');
      }
    } catch (err) {
      console.warn('Failed to draw footer', err);
    }

    if (shouldShare) {
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${baseFilename}.pdf`, { type: 'application/pdf' });
      onSuccess(file);
    } else {
      onDownloadDirect(pdf, `${baseFilename}.pdf`);
    }

  } catch (error) {
    console.error('Error in generateSmartPdf:', error);
    onError(error);
  }
};

