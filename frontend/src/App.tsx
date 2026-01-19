import { Toaster } from "./shared/components/toaster";
import NotFound from "./shared/components/NotFound";
import LoginPage from "./modules/auth/pages/LoginPage";
import UsersPage from "./modules/users/pages/UsersPage";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { AppLayout } from "./shared/components/AppLayout";
import { AuthProvider } from "./shared/contexts/AuthContext";
import SendersPage from "./modules/senders/pages/SendersPage";
import UserFormPage from "./modules/users/pages/UserFormPage";
import { ErrorProvider } from "./shared/contexts/ErrorContext";
import DashboardPage from "./modules/dashboard/pages/DashboardPage";
import ReceiversPage from "./modules/receivers/pages/ReceiversPage";
import SendMoneyPage from "./modules/transactions/pages/SendMoneyPage";
import MonitoringPage from "./modules/monitoring/pages/MonitoringPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReceiverFormPage from "./modules/receivers/pages/ReceiverFormPage";
import { Navigate, Routes, Route, BrowserRouter } from "react-router-dom";
import TransactionsPage from "./modules/transactions/pages/TransactionsPage";
import { PublicRoute, ProtectedRoute } from "./shared/components/routing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/new" element={<UserFormPage />} />
        <Route path="users/:id/edit" element={<UserFormPage />} />
        <Route path="senders" element={<SendersPage />} />
        <Route path="receivers" element={<ReceiversPage />} />
        <Route path="receivers/new" element={<ReceiverFormPage />} />
        <Route path="receivers/:id/edit" element={<ReceiverFormPage />} />
        <Route path="send-money" element={<SendMoneyPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorProvider>
      <TooltipProvider>
        <Toaster />
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
