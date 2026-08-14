import { Component, ErrorInfo, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import E500 from "views/error/500";

type Props = {
  children: ReactNode;
  resetKey?: string;
};

type State = {
  hasError: boolean;
};

class AppErrorBoundaryInner extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <E500 />;
    }
    return this.props.children;
  }
}

/** Reseta o 500 ao mudar de rota (HMR / navegação). */
export default function AppErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <AppErrorBoundaryInner resetKey={pathname}>{children}</AppErrorBoundaryInner>;
}
