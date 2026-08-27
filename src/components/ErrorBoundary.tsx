// @ts-nocheck
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', border: '2px solid #b91c1c', borderRadius: '8px', margin: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>حدث خطأ في النظام</h2>
          <p className="text-sm text-gray-500 mt-2">
            حدث خطأ غير متوقع. يرجى تحديث الصفحة.
            <br />
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button 
            type="button"
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '15px', padding: '10px 20px', background: '#991b1b', color: 'white', borderRadius: '5px' }}
          >
            العودة للرئيسية
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
