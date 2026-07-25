import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
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
