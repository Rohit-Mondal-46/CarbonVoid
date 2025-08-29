import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const error = searchParams.get('error');
      const authSuccess = searchParams.get('auth');

      if (error) {
        console.error('Authentication error:', error);
        navigate('/?error=' + error);
        return;
      }

      if (authSuccess === 'success') {
        // Refresh auth status to get user data
        await checkAuthStatus();
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, checkAuthStatus]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg">Completing authentication...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
