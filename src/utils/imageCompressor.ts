/**
 * Compress an uploaded image file using Canvas.
 * Reduces dimensions if wider than 1000px and saves as low-quality JPEG to optimize memory.
 * @param file - The input File object from a file input.
 * @returns A promise that resolves to the compressed JPEG base64 Data URL.
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 600; // Aggressive compression for localStorage limits
      let width = bitmap.width;
      let height = bitmap.height;
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height);
        // Using 0.5 quality for tiny file size (~20-40KB) to prevent 5MB localStorage crash
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        canvas.width = 0;
        canvas.height = 0;
        resolve(dataUrl); 
        if (bitmap.close) bitmap.close();
      } else {
        if (bitmap.close) bitmap.close();
        reject(new Error("Canvas context unavailable"));
      }
    } catch (error) {
      reject(error);
    }
  });
};
