import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { authService } from '../../services/authService';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.login(username, password);
      onAuthSuccess();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: string } })?.response?.data || 'Login failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.register(username, email, password);
      onAuthSuccess();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: string } })?.response?.data || 'Registration failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLogin ? (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setIsLogin(false);
            setError(null);
          }}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <RegisterForm
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setIsLogin(true);
            setError(null);
          }}
          isLoading={isLoading}
          error={error}
        />
      )}
    </>
  );
};