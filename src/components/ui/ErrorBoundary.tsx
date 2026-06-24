import { Component, type ReactNode, type ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.wrapper}>
          <h2 className={styles.heading}>应用错误</h2>
          <pre className={styles.stack}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            className={styles.retryBtn}
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            刷新重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
