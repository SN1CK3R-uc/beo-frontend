import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { usePageTitle } from '@/hooks/usePageTitle';

const schema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  passKey: z.string().min(1, 'Pass Key is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  usePageTitle('Login');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.userId.trim(), data.passKey.trim());
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch {
      toast.error('Invalid User ID or Passkey');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <div className="login-left-overlay" />

          <div className="login-left-content">
            <div className="login-brand">
              <img
                src="/logo.png"
                alt="Building Entrepreneurs"
                className="login-logo"
              />
              <div className="login-brand-text">
                <h2>Building Entrepreneurs</h2>
                <p>Creating Great Minds For Youths</p>
              </div>
            </div>

            <p className="login-description">
              Empowering the next generation of leaders through innovation,
              collaboration, and community action.
            </p>
          </div>
        </div>

        <div className="login-right">
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your workspace</p>

            <div className="input-group">
              <label htmlFor="userId">User ID</label>
              <input
                id="userId"
                {...register('userId')}
                placeholder="e.g. USR-101"
                autoComplete="username"
                disabled={isSubmitting}
              />
              {errors.userId && (
                <span className="input-error">{errors.userId.message}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="passKey">Pass Key</label>
              <input
                id="passKey"
                type="password"
                {...register('passKey')}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              {errors.passKey && (
                <span className="input-error">{errors.passKey.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Login'}
            </button>

            <div className="login-footer">
              Forgot credentials?{' '}
              <a href="#reset">Request reset link</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}