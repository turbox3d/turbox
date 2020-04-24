import * as React from 'react'

export default class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: {
      message: ''
    }
  };

  componentDidCatch(error: Error) {
    this.setState({
      hasError: true,
      error
    });
  }

  render() {
    const { message } = this.state.error;
    if (this.state.hasError) {
      return <h2>Something went wrong. Error: {message}</h2>
    }
    return this.props.children
  }
}
