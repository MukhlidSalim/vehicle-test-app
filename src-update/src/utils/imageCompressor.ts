/**
 * Compress an uploaded image file using Canvas.
 * Reduces dimensions if wider than 1000px and saves as low-quality JPEG to optimize memory.
 * @param file - The input File object from a file input.
 * @returns A promise that resolves to the compressed JPEG base64 Data URL.
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000; // Optimal for mobile memory limits
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Balance between quality and memory size
        } else {
          reject(new Error("Canvas context unavailable"));
        }
      };
      img.onerror = () => reject(new Error("Image failed to load"));
    };
    reader.onerror = (error) => reject(error);
  });
};
