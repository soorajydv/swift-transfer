import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '../LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('PublicRoute check:', { isAuthenticated, isLoading });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    console.log('Authenticated user trying to access login, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
