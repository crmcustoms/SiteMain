'use client';

import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Обновляем состояние, чтобы следующий рендер показал запасной UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Можно также отправить отчет об ошибке в сервис логирования
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Вы можете отрендерить любой запасной UI
      return (
        <div>
          <h2>Что-то пошло не так.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Детали ошибки</summary>
            {this.state.error && this.state.error.toString()}
          </details>
          {this.props.fallback}
        </div>
      );
    }

    return this.props.children;
  }
} 