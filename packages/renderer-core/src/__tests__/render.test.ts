import { Component } from '../component';

describe('render', () => {
  it('render', () => {
    class A extends Component {
      render() {
        return [];
      }
    }
    class B extends Component {
      render() {
        return [];
      }
    }
    class Root extends Component {
      render() {
        return [
          {
            component: A,
            props: {},
          },
          {
            component: B,
            props: {},
          },
        ];
      }
    }
  });
});
