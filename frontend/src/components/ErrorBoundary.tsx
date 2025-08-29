import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  level?: 'page' | 'component' | 'global';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      copied: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service (you can add Sentry, LogRocket, etc.)
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.length > 0) {
        this.resetErrorBoundary();
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  private readonly reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In production, you'd send this to your error tracking service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component'
    };

    // For now, just log it. Later you can integrate with Sentry, LogRocket, etc.
    console.error('Error Report:', errorReport);
    
    // Example: Send to your backend error logging
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // }).catch(console.error);
  };

  private readonly resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      copied: false
    });
  };

  private readonly handleCopyError = async () => {
    const { error, errorInfo, errorId } = this.state;
    
    const errorDetails = `Error ID: ${errorId}
Error Message: ${error?.message || 'Unknown error'}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Error Stack:
${error?.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}`;

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = errorDetails;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      this.setState({ copied: true });
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    }
  };

  private readonly handleRetry = () => {
    this.resetErrorBoundary();
  };

  private readonly handleReload = () => {
    window.location.reload();
  };

  private readonly handleGoHome = () => {
    window.location.href = '/';
  };

  private readonly handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const githubIssueUrl = new URL('https://github.com/arthurboss/chordium/issues/new');
    
    const title = `Bug Report: ${error?.message || 'Unexpected Error'}`;
    const body = `**Error ID:** ${errorId}
**Error Message:** ${error?.message || 'Unknown error'}
**URL:** ${window.location.href}
**User Agent:** ${navigator.userAgent}
**Timestamp:** ${new Date().toISOString()}

**Error Stack:**
\`\`\`
${error?.stack || 'No stack trace available'}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo?.componentStack || 'No component stack available'}
\`\`\`

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**

**Actual Behavior:**
`;

    githubIssueUrl.searchParams.set('title', title);
    githubIssueUrl.searchParams.set('body', body);
    githubIssueUrl.searchParams.set('labels', 'bug');
    
    window.open(githubIssueUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;
      const isGlobalError = level === 'global';
      const isPageError = level === 'page';
      
      let title: string;
      if (isGlobalError) {
        title = 'Application Error';
      } else if (isPageError) {
        title = 'Page Error';
      } else {
        title = 'Something went wrong';
      }

      let description: string;
      if (isGlobalError) {
        description = 'The application encountered an unexpected error and needs to be reloaded.';
      } else if (isPageError) {
        description = 'This page encountered an error. You can try refreshing or go back to the home page.';
      } else {
        description = 'This component encountered an error. You can try again or refresh the page.';
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">
                {title}
              </CardTitle>
              <CardDescription>
                {description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error ID:</strong> {this.state.errorId}
                  <br />
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!isGlobalError && (
                  <Button 
                    onClick={this.handleRetry} 
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReload} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              <div className="pt-4 border-t space-y-3">
                <Button 
                  onClick={this.handleReportBug} 
                  variant="ghost" 
                  size="sm"
                  className="w-full text-muted-foreground"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Report this issue on GitHub
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 p-4 bg-muted rounded-md">
                  <summary className="cursor-pointer font-medium mb-2">
                    🐛 Development Details (Click to expand)
                  </summary>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between items-center">
                      <strong>Error Stack:</strong>
                      <Button 
                        onClick={this.handleCopyError} 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        {this.state.copied ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy All
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="mt-1 overflow-auto text-xs bg-background p-2 rounded border">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 overflow-auto text-xs bg-background p-2 rounded border">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
