import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="font-display text-lg font-semibold">
              {this.props.fallbackMessage || 'Algo correu mal. Tenta novamente.'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Se o problema persistir, recarregue a página.
            </p>
          </div>
          <Button onClick={this.handleRetry} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
