import { mirrorImage, getRenderTargetImageData, loadImageBase64, loadImage, loadImageElement, cropImage, base64toBlob } from './image';

export default class ImageSystem {
  static mirrorImage = mirrorImage;
  static getRenderTargetImageData = getRenderTargetImageData;
  static loadImageBase64 = loadImageBase64;
  static loadImage = loadImage;
  static loadImageElement = loadImageElement;
  static cropImage = cropImage;
  static base64toBlob = base64toBlob;
}
