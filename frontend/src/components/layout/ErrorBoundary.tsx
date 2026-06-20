import { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Btn } from "@/components/shared";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-6 shrink-0 shadow-sm">
            <AlertOctagon size={32} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
            An unexpected error occurred while rendering this page. You can try
            reloading the page, or contact support if the issue persists.
          </p>
          {this.state.error && (
            <pre className="text-left bg-muted/40 p-4 rounded-xl border border-border text-xs font-mono text-muted-foreground max-w-lg max-h-40 overflow-y-auto mb-6 w-full leading-relaxed">
              {this.state.error.toString()}
            </pre>
          )}
          <Btn onClick={this.handleReload} size="md">
            <RefreshCw size={14} className="mr-2" /> Reload page
          </Btn>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
