// import { Mesh3D, ViewEntity3D, IViewEntity, EntityObject, Reactive } from '@turbox3d/turbox';
// import * as THREE from 'three';
// import React from 'react';
// import { appCommandBox } from './index';
// import { WireFrame } from './wireframe';

// interface IBoxProps {
//   model: EntityObject;
// }

// function randomColor() {
//   let c = Math.floor(Math.random() * 256);
//   while (c === 0 || c > 255) {
//     c = Math.floor(Math.random() * 256);
//   }
//   return c;
// }
// function prefix(num: number, val: string) {
//   return (new Array(num).join('0') + val).slice(-num);
// }
// export function color16() {
//   const r = randomColor().toString(16);
//   const g = randomColor().toString(16);
//   const b = randomColor().toString(16);
//   const color = '#' + prefix(2, r) + prefix(2, g) + prefix(2, b);
//   return color;
// }

// export class Box extends Mesh3D<IBoxProps> {
//   protected reactivePipeLine = [
//     this.updateGeometry,
//   ];
//   protected view = new THREE.Mesh();

//   updateGeometry() {
//     const geometry = new THREE.BoxGeometry(this.props.model.size.x, this.props.model.size.y, this.props.model.size.z);
//     const material = new THREE.MeshBasicMaterial({ color: color16() });
//     this.view.geometry = geometry;
//     this.view.material = material;
//     this.view.position.set(0, 0, 0);
//   }
// }

// interface IProps extends IViewEntity {
//   model: EntityObject;
// }

// @Reactive
// export class BoxViewEntity extends ViewEntity3D<IProps> {
//   protected reactivePipeLine = [
//     this.updatePosition,
//     this.updateRotation,
//     this.updateScale,
//   ];

//   render() {
//     const { model } = this.props;
//     const isSelected = appCommandBox.defaultCommand.select.getSelectedEntities().includes(model);
//     return (
//       <React.Fragment>
//         {isSelected && <WireFrame model={model} />}
//         <Box model={model} />
//       </React.Fragment>
//     );
//   }

//   private updatePosition() {
//     const { model } = this.props;
//     this.view.position.set(model.position.x, model.position.y, model.position.z);
//   }

//   private updateRotation() {
//     const { model } = this.props;
//     this.view.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
//   }

//   private updateScale() {
//     const { model } = this.props;
//     this.view.scale.set(model.scale.x, model.scale.y, model.scale.z);
//   }
// }
