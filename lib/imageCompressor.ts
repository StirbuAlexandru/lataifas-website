/**
 * Compresie imagini pe client (browser) folosind Canvas API.
 * Reduce dimensiunea imaginilor cu ~70-80% față de originalul PNG/JPEG.
 * Convertează la WebP cu lățime maximă 1200px și calitate 82%.
 */

export interface CompressedImage {
  blob: Blob;
  base64: string;
  fileName: string;
  originalSizeKB: number;
  compressedSizeKB: number;
}

export const compressImage = (
  file: File,
  maxWidth = 1200,
  quality = 0.82
): Promise<CompressedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionează dacă e mai lată de maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));

            const reader2 = new FileReader();
            reader2.readAsDataURL(blob);
            reader2.onloadend = () => {
              resolve({
                blob,
                base64: reader2.result as string,
                fileName: file.name.replace(/\.[^.]+$/, '.webp'),
                originalSizeKB: Math.round(file.size / 1024),
                compressedSizeKB: Math.round(blob.size / 1024),
              });
            };
            reader2.onerror = () => reject(new Error('Failed to read compressed blob'));
          },
          'image/webp',
          quality
        );
      };
    };
  });
};
