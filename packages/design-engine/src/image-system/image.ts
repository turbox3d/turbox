import { Vector2 } from '@turbox3d/math';
import { updateQueryStringParameter, Vec2 } from '@turbox3d/shared';
import * as THREE from 'three';

function convertUrl(url: string, key = 'turbox') {
  if (url.includes(';base64,') || !url) {
    return url;
  }
  return updateQueryStringParameter(url, key, 'true');
}

export const mirrorImage = (image: string | Blob, materialDirection: Vector2, isBase64 = false, fileType = 'image/png', quality = 1) => {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = image instanceof Blob ? URL.createObjectURL(image) : convertUrl(image);
  return new Promise<string | Blob>((resolve) => {
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
  });
};

export const getRenderTargetImageData = (
  app: any,
  width: number,
  height: number,
  scene: any,
  camera: any,
  fileType = 'image/png',
  quality = 1
) => {
  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
  });
  // renderTarget.viewport = new THREE.Vector4(0, 0, width, height);
  app.setRenderTarget(renderTarget);
  app.render(scene, camera);
  const buffer = new Uint8Array(width * height * 4);
  const clamped = new Uint8ClampedArray(buffer.buffer);
  app.readRenderTargetPixels(renderTarget, 0, 0, width, height, buffer);
  return new Promise<Blob>(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(clamped, width, height);
    ctx!.putImageData(imageData, 0, 0);
    app.setRenderTarget(null);
    app.render(scene, camera);
    canvas.toBlob(
      async blob => {
        if (blob) {
          const image = (await mirrorImage(blob, new Vector2(1, -1), false, fileType)) as Blob;
          resolve(image);
        }
      },
      fileType,
      quality
    );
  });
};

export async function loadImageBase64(url: string | Blob, fileType = 'image/png', quality = 1) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url instanceof Blob ? URL.createObjectURL(url) : convertUrl(url);
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

export async function loadImage(url: string | Blob, fileType = 'image/png', quality = 1) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url instanceof Blob ? URL.createObjectURL(url) : convertUrl(url);
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

export async function loadImageElement(url: string | Blob) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url instanceof Blob ? URL.createObjectURL(url) : convertUrl(url);
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

export async function cropImage(url: string | Blob, rect: { start: Vec2; end: Vec2 }, fileType = 'image/png', quality = 1) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url instanceof Blob ? URL.createObjectURL(url) : convertUrl(url);
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

export function base64toBlob(data: string, sliceSize = 512) {
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
}
