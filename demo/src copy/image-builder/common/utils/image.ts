import { Vector2, Vec2 } from '@byted-tx3d/turbox';

function updateQueryStringParameter(url: string, key: string, value: string) {
  if (!value) {
    return url;
  }
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = url.indexOf('?') !== -1 ? '&' : '?';
  if (url.match(re)) {
    return url.replace(re, `$1${key}=${value}$2`);
  } else {
    return `${url + separator + key}=${value}`;
  }
}

export function convertUrl(url: string, maxWidth = 2560) {
  if (url.includes(';base64,') || url.includes('blob:') || !url) {
    return url;
  }
  return updateQueryStringParameter(
    // `${url}?x-oss-process=image/resize,w_${maxWidth}/format,webp`,
    `${url}`,
    'imagebuilder',
    'true'
  );
}

export const mirrorImage = (
  image: string | Blob,
  materialDirection: Vector2,
  isBase64 = false,
  fileType = 'image/png',
  quality = 1,
  maxWidth?: number
) =>
  new Promise<string | Blob>(resolve => {
    if (materialDirection.x === 1 && materialDirection.y === 1) {
      resolve(image);
    } else {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = image instanceof Blob ? URL.createObjectURL(image) : convertUrl(image, maxWidth);
      img.onload = () => {
        image instanceof Blob && URL.revokeObjectURL(img.src);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.translate(materialDirection.x === -1 ? canvas.width : 0, materialDirection.y === -1 ? canvas.height : 0);
        ctx.scale(materialDirection.x, materialDirection.y);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        if (isBase64) {
          resolve(`${canvas.toDataURL(fileType, quality)}`);
        } else {
          canvas.toBlob(
            blob => {
              if (blob) {
                resolve(blob);
              }
            },
            fileType,
            quality
          );
        }
      };
    }
  });

export async function loadImageBase64(url: string | Blob, fileType = 'image/png', quality = 1, maxWidth?: number) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url instanceof Blob ? URL.createObjectURL(url) : convertUrl(url, maxWidth);
  return new Promise<{
    base64: string;
    width: number;
    height: number;
  }>(resolve => {
    img.onload = () => {
      url instanceof Blob && URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      const base64 = `${canvas.toDataURL(fileType, quality)}`;
      resolve({
        base64,
        width: img.width,
        height: img.height,
      });
    };
  });
}

export async function loadImage(url: string | Blob, fileType = 'image/png', quality = 1, maxWidth?: number) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url instanceof Blob ? URL.createObjectURL(url) : convertUrl(url, maxWidth);
  return new Promise<{
    blob: Blob | null;
    width: number;
    height: number;
  }>(resolve => {
    img.onload = () => {
      url instanceof Blob && URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => {
          resolve({
            blob,
            width: img.width,
            height: img.height,
          });
        },
        fileType,
        quality
      );
    };
  });
}

export async function loadImageElement(url: string | Blob, maxWidth?: number) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url instanceof Blob ? URL.createObjectURL(url) : convertUrl(url, maxWidth);
  return new Promise<{
    element: HTMLImageElement;
    width: number;
    height: number;
  }>(resolve => {
    img.onload = () => {
      url instanceof Blob && URL.revokeObjectURL(img.src);
      resolve({
        element: img,
        width: img.width,
        height: img.height,
      });
    };
  });
}

export async function cropImage(
  url: string | Blob,
  rect: { start: Vec2; end: Vec2 },
  fileType = 'image/png',
  quality = 1,
  maxWidth?: number
) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url instanceof Blob ? URL.createObjectURL(url) : convertUrl(url, maxWidth);
  return new Promise<{
    blob: Blob | null;
    width: number;
    height: number;
  }>(resolve => {
    img.onload = () => {
      url instanceof Blob && URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width * (rect.end.x - rect.start.x);
      canvas.height = img.height * (rect.end.y - rect.start.y);
      ctx.drawImage(
        img,
        img.width * rect.start.x,
        img.height * rect.start.y,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      canvas.toBlob(
        blob => {
          resolve({
            blob,
            width: canvas.width,
            height: canvas.height,
          });
        },
        fileType,
        quality
      );
    };
  });
}

export const base64toBlob = (data: string, sliceSize = 512) => {
  const parts = data.split(';base64,');
  const imageType = parts[0].split(':')[1];
  const byteCharacters = window.atob(parts[1]);
  const byteArrays: BlobPart[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: imageType });
  return blob;
};
