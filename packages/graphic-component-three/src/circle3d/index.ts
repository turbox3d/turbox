import { Mesh3D } from '@turbox3d/renderer-three';
import * as THREE from 'three';
import { Vec3 } from '@turbox3d/shared';

interface ICircleProps {
  radius: number;
  color?: number;
  imgUrl?: string;
  imgScale?: Vec3;
  scale?: Vec3;
  opacity?: number;
}

export default class Circle3d extends Mesh3D<ICircleProps> {
  sprite = new THREE.Sprite();
  protected view = new THREE.Mesh();
  protected reactivePipeLine = [this.updateGeometry, this.updateImage];

  async updateGeometry() {
    const { scale = { x: 1, y: 1, z: 1 }, radius, color, opacity = 1 } = this.props;
    const geometry = new THREE.CircleGeometry(radius, 32);
    const material = new THREE.MeshBasicMaterial({ color: color || 0xBF975B, opacity, transparent: true });
    (this.view as THREE.Mesh).geometry = geometry;
    (this.view as THREE.Mesh).material = material;
    this.view.scale.set(scale.x, scale.y, scale.z);
  }

  async updateImage() {
    const { imgScale, radius, imgUrl } = this.props;
    if (imgUrl) {
      const spriteMaterial = new THREE.SpriteMaterial();
      const loader = new THREE.TextureLoader();
      loader.setWithCredentials(true);
      const map = await loader.loadAsync(imgUrl).catch((err) => {
        console.error(err);
      });
      if (!map) {
        return;
      }
      spriteMaterial.map = map;
      spriteMaterial.map.minFilter = THREE.LinearFilter;
      this.sprite.scale.set(imgScale?.x || radius * 2 - 5, imgScale?.y || radius * 2 - 5, imgScale?.z || 1);
      this.sprite.material = spriteMaterial;
      this.view.add(this.sprite);
    }
  }
}
