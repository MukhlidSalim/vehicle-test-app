import React, { useEffect, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { X, CheckCircle, ScanLine, Loader } from 'lucide-react';

interface OdometerScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
  isRTL: boolean;
}

export const OdometerScanner: React.FC<OdometerScannerProps> = ({ onScan, onClose, isRTL }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Start Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setErrorMsg(isRTL ? 'تعذر الوصول للكاميرا' : 'Camera access failed');
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRTL]);

  const processImage = (canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const cw = canvas.width;
    const ch = canvas.height;
    
    ctx.drawImage(video, 0, 0, cw, ch);
    
    // Crop middle 80% width, 20% height
    const cropW = cw * 0.8;
    const cropH = ch * 0.2;
    const cropX = (cw - cropW) / 2;
    const cropY = (ch - cropH) / 2;
    
    const imageData = ctx.getImageData(cropX, cropY, cropW, cropH);
    const data = imageData.data;
    
    // Grayscale & high contrast
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      const color = avg > 110 ? 255 : 0; 
      data[i] = color;
      data[i+1] = color;
      data[i+2] = color;
    }
    
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');
    if (cropCtx) {
      cropCtx.putImageData(imageData, 0, 0);
    }
    
    return cropCanvas.toDataURL('image/jpeg');
  };

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    setProgress(isRTL ? 'جاري التحضير...' : 'Preparing...');
    
    try {
      const imgData = processImage(canvasRef.current, videoRef.current);
      if (!imgData) throw new Error('Image processing failed');
      
      setProgress(isRTL ? 'تهيئة المحرك...' : 'Initializing...');
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(`${isRTL ? 'جاري المسح:' : 'Scanning:'} ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
      });
      
      const { data: { text } } = await worker.recognize(imgData);
      await worker.terminate();
      
      const numbersOnly = text.replace(/[^0-9]/g, '');
      
      if (numbersOnly.length > 0) {
        setSuccess(true);
        setTimeout(() => {
          onScan(numbersOnly);
        }, 1500);
      } else {
        setErrorMsg(isRTL ? 'لم يتم العثور على أرقام واضحة' : 'No clear numbers found');
        setIsScanning(false);
      }
    } catch (err) {
      setErrorMsg(isRTL ? 'فشل المسح الذكي' : 'Smart scan failed');
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 flex flex-col items-center justify-center backdrop-blur-md animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
      >
        <X size={24} />
      </button>
      
      <div className="w-full max-w-md p-6 flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">{isRTL ? 'المسح الذكي للعداد' : 'Smart Odometer Scan'}</h2>
          <p className="text-sm text-gray-300 font-bold">{isRTL ? 'ضع أرقام العداد داخل الإطار المحدد' : 'Place odometer digits inside the frame'}</p>
        </div>
        
        <div className="relative w-full aspect-[4/3] bg-black rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
          {errorMsg ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 text-white font-black p-6 text-center leading-relaxed">
              {errorMsg}
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" width={800} height={600} />
              
              {/* Overlay Frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[80%] h-[20%] border-4 border-primary-500 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] relative transition-all overflow-hidden">
                   {isScanning && (
                     <div className="absolute inset-0 bg-primary-500/20 animate-pulse" />
                   )}
                   {isScanning && (
                     <div className="absolute top-0 left-0 w-full h-1 bg-primary-400 shadow-[0_0_15px_#38bdf8] animate-[bounce_2s_ease-in-out_infinite]" />
                   )}
                </div>
              </div>
            </>
          )}
          
          {success && (
            <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center text-white gap-3 animate-in zoom-in">
              <CheckCircle size={64} className="animate-bounce" />
              <span className="font-black text-xl">{isRTL ? 'تم الالتقاط!' : 'Captured!'}</span>
            </div>
          )}
        </div>
        
        {!success && !errorMsg && (
          <div className="w-full">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                isScanning ? 'bg-primary-800 text-primary-300' : 'bg-primary-500 hover:bg-primary-600 text-white shadow-xl shadow-primary-500/30 active:scale-95'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader size={24} className="animate-spin" />
                  <span className="v-center-cairo">{progress}</span>
                </>
              ) : (
                <>
                  <ScanLine size={24} />
                  <span className="v-center-cairo">{isRTL ? 'مسح العداد الآن' : 'Scan Odometer Now'}</span>
                </>
              )}
            </button>
          </div>
        )}
        
        {errorMsg && (
          <button
            onClick={() => { setErrorMsg(''); setIsScanning(false); }}
            className="w-full py-4 rounded-2xl font-black text-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
          >
            {isRTL ? 'إعادة المحاولة' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
};
