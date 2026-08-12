import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SkeletonLoader } from './SkeletonLoader';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 p-8 flex items-center justify-center">
        <SkeletonLoader type="cards" count={3} />
      </div>
    );
  }

  // If Supabase is configured and no user logged in, redirect to /login
  if (isConfigured && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
