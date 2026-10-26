import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Kanban, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login({ username: username.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-700/60 shadow-2xl relative z-10 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-3.5">
            <Kanban className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
            Welcome to Trello
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to access your organizations and agile boards
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            placeholder="e.g. alexsmith"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 font-semibold"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Register footer link */}
        <div className="mt-8 text-center pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
