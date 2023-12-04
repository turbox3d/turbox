// import * as React from 'react';
// import { HintCommand, SelectionCommand, BaseCommandBox, compose, Scene3D, IViewEntity, SceneEvent, Reactive, EntityObject } from '@turbox3d/turbox';
// import { Box, BoxViewEntity } from './box';

// class Entity extends EntityObject {
// }
// const entities: Entity[] = [];

// function getNeg() {
//   const gap = 200;
//   return Math.random() > 0.5 ? -gap : gap;
// }
// for (let index = 0; index < 50; index++) {
//   const entity = new Entity();
//   entity.setSize({ x: 30, y: 30, z: 30 });
//   entity.setPosition({
//     x: Math.random() * getNeg(),
//     y: Math.random() * getNeg(),
//     z: Math.random() * getNeg(),
//   });
//   entities.push(entity);
// }

// class DefaultCommand extends compose({
//   select: SelectionCommand,
//   hint: HintCommand,
// }) {
//   active() {
//     this.select.active({
//       hint: this.hint,
//     });
//     this.hint.active(this.select);
//   }

//   // onClick(viewEntity: IViewEntity, event: SceneEvent) {
//   //   console.log('***', viewEntity);
//   // }
// }

// class AppCommandBox extends BaseCommandBox {
//   defaultCommand = new DefaultCommand(this);

//   constructor() {
//     super();
//     this.defaultCommand.apply();
//   }
// }

// export const appCommandBox = new AppCommandBox();

// export class Scene3DFront extends React.Component {
//   render() {
//     return (
//       <Scene3D
//         id="scene3d"
//         container="app"
//         transparent={false}
//         commandBox={appCommandBox}
//         skyBoxImages={[
//           'https://img.alicdn.com/imgextra/i1/O1CN01a6GX3j1Sik7JM7aai_!!6000000002281-2-tps-1800-1800.png',
//           'https://img.alicdn.com/imgextra/i2/O1CN01PD3inR1poucQ2EOGD_!!6000000005408-2-tps-1800-1800.png',
//           'https://img.alicdn.com/imgextra/i2/O1CN01oFyCQW1LeR5IlBpil_!!6000000001324-2-tps-1800-1800.png',
//           'https://img.alicdn.com/imgextra/i2/O1CN01NBtLXn1d8WZbAH8SB_!!6000000003691-2-tps-1800-1800.png',
//           'https://img.alicdn.com/imgextra/i1/O1CN01krgToR1SjCWAWNSCK_!!6000000002282-2-tps-1800-1800.png',
//           'https://img.alicdn.com/imgextra/i2/O1CN01tkXWku1XdltxcnaeB_!!6000000002947-2-tps-1800-1800.png',
//         ]}
//         // backgroundColor={0xCCCCCC}
//         cameraPosition={{ x: 0, y: 0, z: 500 }}
//         cameraTarget={{ x: 0, y: 0, z: 0 }}
//       >
//         {entities.map(entity => <BoxViewEntity type={Symbol('box')} id={entity.id} model={entity} />)}
//       </Scene3D>
//     );
//   }
// }

// // test
// // class Test3DMesh extends Box {
// //   protected view;
// //   draw() {
// //     setTimeout(() => {
// //       const mesh = convertBufferGeometryToStreamingMesh(
// //         new THREE.BoxBufferGeometry(15, 15, 15),
// //       );
// //       const meshComp = new MeshComponent();
// //       meshComp.setMesh(mesh as Mesh);
// //       const Mat = new MeshBasicMaterial({ });
// //       meshComp.setMaterial(Mat);
// //       this.view.addComponent(meshComp);
// //     }, 3000);
// //   }
// // }
