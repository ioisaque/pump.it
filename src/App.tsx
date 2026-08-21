import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SAFE_AREA_TOP } from "components/layout/FakeStatusBar";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) return false;
        return failureCount < 1;
      },
    },
  },
});

const toasterContainerStyle = {
  top: `calc(16px + ${SAFE_AREA_TOP})`,
  bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
};

function App() {
  useEffect(() => {
    const onLogout = () => {
      queryClient.cancelQueries();
      queryClient.clear();
    };
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster containerStyle={toasterContainerStyle} />
        <AppRoutes />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
