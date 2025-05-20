export function updateQueryStringParameter(url: string, key: string, value: string) {
  if (!value) {
    return url;
  }
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = url.indexOf('?') !== -1 ? '&' : '?';
  if (url.match(re)) {
    return url.replace(re, `$1${key}=${value}$2`);
  }
  return `${url}${separator}${key}=${value}`;
}

function convertUrl(url: string, key = 'turbox') {
  if (url.includes(';base64,') || !url) {
    return url;
  }
  return updateQueryStringParameter(url, key, 'true');
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
