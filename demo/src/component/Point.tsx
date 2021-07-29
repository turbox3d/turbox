import { reactive, Reactive } from '@turbox3d/reactivity-react';
import React from 'react';
import { Point } from '../domain/point';
import { cts } from './index';
import Point2d from '../math/Point2d';
import { EPointType } from '../types/enum';
import { Line } from '../domain/line';

interface IProps {
  data: Point;
  index: number;
}

// const PointComp: React.FC<IProps> = ({ data, index }) => {
//   console.log('***childPoint');
//   console.log('index: ', index);
//   const updateFirstPointPosition = (index) => () => {
//     cts.countertops[0].updatePointByIndex(index, new Point2d(1000, 1000));
//   }
//   React.useEffect(() => {
//     console.log('point didMount');
//     cts.countertops[0].addLine(new Line({
//       start: new Point({
//         position: new Point2d(200, 200),
//         type: EPointType.NONE,
//       }),
//       end: new Point({
//         position: new Point2d(200, 200),
//         type: EPointType.NONE,
//       }),
//     }));
//     cts.countertops[0].addLine(new Line({
//       start: new Point({
//         position: new Point2d(200, 200),
//         type: EPointType.NONE,
//       }),
//       end: new Point({
//         position: new Point2d(200, 200),
//         type: EPointType.NONE,
//       }),
//     }));
//   }, []);
//   return (
//     <React.Fragment>
//       <span>position：{data && data.position && JSON.stringify(data.position)}</span>
//       <span>prevLine：{data && data.prevLine && JSON.stringify(data.prevLine)}</span>
//       <button onClick={updateFirstPointPosition(index)}>point btn</button>
//       {/* {cts.countertops[0].info.b && cts.countertops.length && cts.countertops[0].info && cts.countertops[0].info.a &&
//         <span>inner: {cts.countertops[0].info.a}</span>
//       } */}
//     </React.Fragment>
//   );
// };

// export default Reactive(PointComp);
let flag = false;

@Reactive
class PointComp extends React.Component<IProps> {
  componentDidMount() {
    // if (flag) {
    //   return;
    // }
    // console.log('point didMount');
    // cts.countertops[0].addLine(new Line({
    //   start: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    //   end: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    // }));
    // cts.countertops[0].addLine(new Line({
    //   start: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    //   end: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    // }));
    // flag = true;
  }

  componentDidUpdate() {
    console.log('***point didUpdate***');
  }

  updateFirstPointPosition = (index) => () => {
    // cts.countertops[0].updatePointsByIndex(index, new Point2d(1000, 1000));
  };

  render() {
    const { index, data } = this.props;
    console.log('***childPoint');
    console.log('index: ', index);
    return (
      <React.Fragment>
        <span>position：{data && data.position && JSON.stringify(data.position)}</span>
        <span>prevLine：{data && data.prevLine && JSON.stringify(data.prevLine)}</span>
        <button onClick={this.updateFirstPointPosition(index)}>point btn</button>
        {/* {cts.countertops[0].info.b && cts.countertops.length && cts.countertops[0].info && cts.countertops[0].info.a &&
        <span>inner: {cts.countertops[0].info.a}</span>
      } */}
        {/* <span>nickName: {cts.countertops[0].nickName}</span> */}
      </React.Fragment>
    );
  }
}

export default PointComp;
