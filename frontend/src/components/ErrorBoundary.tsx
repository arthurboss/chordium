import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import i18n from '@/i18n/config';

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
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  private readonly isChunkLoadError = (error: Error): boolean => {
    return (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError'
    );
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (this.isChunkLoadError(error)) {
      const reloadKey = 'chordium_chunk_reload_attempted';
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        window.location.reload();
        return;
      }
      // Already tried reloading once — clear the flag so future navigations can retry
      sessionStorage.removeItem(reloadKey);
    }

    this.setState({
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

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

    console.error('Error Report:', errorReport);
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
      
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;
      const isGlobalError = level === 'global';
      const isPageError = level === 'page';
      
      const t = i18n.isInitialized ? i18n.t.bind(i18n) : ((key: string) => key.split(".").pop() || key);

      let title: string;
      if (isGlobalError) {
        title = t('errors:boundary.applicationError');
      } else if (isPageError) {
        title = t('errors:boundary.pageError');
      } else {
        title = t('errors:boundary.somethingWentWrong');
      }

      let description: string;
      if (isGlobalError) {
        description = t('errors:boundary.applicationErrorDesc');
      } else if (isPageError) {
        description = t('errors:boundary.pageErrorDesc');
      } else {
        description = t('errors:boundary.componentErrorDesc');
      }

      return (
        <div className="min-h-dvh bg-background flex items-center justify-center p-4">
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
                  <strong>{t('errors:boundary.errorId')}</strong> {this.state.errorId}
                  <br />
                  <strong>{t('errors:boundary.error')}</strong> {this.state.error?.message || t('errors:boundary.unknownError')}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!isGlobalError && (
                  <Button 
                    onClick={this.handleRetry} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t('errors:boundary.tryAgain')}
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReload} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('errors:boundary.reloadPage')}
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  {t('errors:boundary.goHome')}
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
                  {t('errors:boundary.reportIssue')}
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 p-4 bg-muted rounded-md">
                  <summary className="cursor-pointer font-medium mb-2">
                    🐛 {t('errors:boundary.devDetails')}
                  </summary>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between items-center">
                      <strong>{t('errors:boundary.errorStack')}</strong>
                      <Button 
                        onClick={this.handleCopyError} 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        {this.state.copied ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            {t('errors:boundary.copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            {t('errors:boundary.copyAll')}
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="mt-1 overflow-auto text-xs bg-background p-2 rounded-sm border">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <div>
                        <strong>{t('errors:boundary.componentStack')}</strong>
                        <pre className="mt-1 overflow-auto text-xs bg-background p-2 rounded-sm border">
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
