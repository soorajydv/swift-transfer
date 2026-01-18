import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingScreen } from "@/components/common/LoadingSpinner";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import UsersPage from "@/pages/UsersPage";
import SendersPage from "@/pages/SendersPage";
import SenderFormPage from "@/pages/SenderFormPage";
import ReceiversPage from "@/pages/ReceiversPage";
import ReceiverFormPage from "@/pages/ReceiverFormPage";
import SendMoneyPage from "@/pages/SendMoneyPage";
import TransactionsPage from "@/pages/TransactionsPage";
import MonitoringPage from "@/pages/MonitoringPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔒 PublicRoute check:', { isAuthenticated, isLoading });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    console.log('🚫 Authenticated user trying to access login, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="senders" element={<SendersPage />} />
        <Route path="senders/new" element={<SenderFormPage />} />
        <Route path="senders/:id/edit" element={<SenderFormPage />} />
        <Route path="receivers" element={<ReceiversPage />} />
        <Route path="receivers/new" element={<ReceiverFormPage />} />
        <Route path="receivers/:id/edit" element={<ReceiverFormPage />} />
        <Route path="send-money" element={<SendMoneyPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorProvider>
  </QueryClientProvider>
);

export default App;
