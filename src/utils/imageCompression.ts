export async function compressImage(file: File, maxSizeMB: number = 5): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        let width = img.width;
        let height = img.height;
        const ratio = file.size / maxSizeBytes;

        if (ratio > 1) {
          const scale = 1 / Math.sqrt(ratio);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }

            if (blob.size > maxSizeBytes) {
              canvas.toBlob(
                (secondBlob) => {
                  if (!secondBlob) {
                    reject(new Error('Canvas is empty'));
                    return;
                  }

                  const compressedFile = new File(
                    [secondBlob],
                    file.name,
                    {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    }
                  );

                  resolve(compressedFile);
                },
                'image/jpeg',
                0.6
              );
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: file.type,
                lastModified: Date.now(),
              }
            );

            resolve(compressedFile);
          },
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          0.85
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
