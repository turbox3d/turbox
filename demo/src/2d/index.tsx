// import * as React from 'react';
// import * as PIXI from 'pixi.js';
// import { Mesh2D, Scene2D } from '@turbox3d/graphic-view-2d';

// const Width = 600;
// const Height = 600;

// export class Scene2DFront extends React.Component {
//   render() {
//     return (
//       <Scene2D
//         container="app"
//         width={Width}
//         height={Height}
//       >
//         <Box />
//       </Scene2D>
//     );
//   }
// }
// class Box extends Mesh2D {
//   protected view = new PIXI.Graphics();
//   draw() {
//     this.view.beginFill(0x00eeee);
//     this.view.drawCircle(150, -300, 200);
//     this.view.endFill();

//     this.view.beginFill(0xee1100);
//     this.view.drawRect(350, -200, 200, 200);
//     this.view.endFill();
//   }
// }
