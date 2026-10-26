import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Kanban, Lock, User, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    if (username.trim().length < 3 || username.trim().length > 50) {
      setError('Username must be between 3 and 50 characters.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError(null);
    setIsLoading(true);

    try {
      await signup({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      setSuccess(true);

      // Auto login after successful signup
      await login({
        username: username.trim(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-700/60 shadow-2xl relative z-10 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-3.5">
            <Kanban className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Join your team to organize and manage projects efficiently
          </p>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>Account created! Redirecting to dashboard...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            placeholder="e.g. john_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            helperText="3 to 50 characters"
            required
            autoFocus
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            helperText="At least 4 characters"
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
            Create Account
          </Button>
        </form>

        {/* Login footer link */}
        <div className="mt-8 text-center pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
