import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class MobileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error for debugging
    console.error('Mobile Error Boundary caught an error:', error, errorInfo);
    
    // You can also send error to analytics service here
    // trackError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.hash = '/dashboard';
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle className="text-xl text-slate-100">Oops! Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-center text-sm">
                Don't worry, this happens sometimes. The app encountered an unexpected error.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-slate-700 p-3 rounded text-xs text-slate-300 overflow-auto max-h-32">
                  <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
              
              <p className="text-xs text-slate-500 text-center mt-4">
                If this problem persists, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MobileErrorBoundary; 