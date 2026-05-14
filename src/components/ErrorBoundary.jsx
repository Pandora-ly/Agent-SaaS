import { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <h2>页面出错了</h2>
          <p style={{ color: '#666', marginTop: 8 }}>
            {this.state.error.message || '未知错误'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              border: '1px solid #1976d2',
              background: '#1976d2',
              color: '#fff',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
