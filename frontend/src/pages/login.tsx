import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.ok) {
      const redirectTo = (() => {
        try {
          const v = window.sessionStorage.getItem('postLoginRedirect');
          window.sessionStorage.removeItem('postLoginRedirect');
          if (!v) return null;
          if (v === '/login' || v === '/register') return null;
          return v.startsWith('/') ? v : `/${v}`;
        } catch {
          return null;
        }
      })();

      window.location.hash = redirectTo ?? '/dashboard';
    } else {
      setError(result.error);
    }
  };

  return (
    <div
      className="h-screen overflow-hidden font-['Plus_Jakarta_Sans',_sans-serif] relative bg-cover bg-center flex items-center justify-center px-6 py-10"
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}login1.jpg)` }}
    >
      <div className="absolute inset-0 bg-[#F0F7FF]/70 backdrop-blur-[2px]" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-[440px] bg-white/65 backdrop-blur-xl rounded-[32px] border border-blue-100/80 p-8 shadow-xl relative z-10">
        <h1 className="text-4xl font-extrabold text-[#2F6FDB] mb-8 text-center">Login</h1>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#64748b]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@gmail.com"
                required
                className="w-full px-5 py-3.5 rounded-xl border border-blue-100 bg-white/90 text-[#1e293b] focus:ring-2 focus:ring-blue-300 outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#64748b]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-5 py-3.5 rounded-xl border border-blue-100 bg-white/90 text-[#1e293b] focus:ring-2 focus:ring-blue-300 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/80 hover:text-blue-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button type="button" className="text-sm text-[#2F6FDB] font-medium hover:underline block ml-auto">
                Forgot Password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 font-medium text-center">{error}</p>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#2F6FDB] text-white rounded-xl font-bold text-lg hover:bg-[#255FC0] transition-all shadow-lg shadow-blue-200/60"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-100"></div>
            </div>
            <span className="relative px-4 bg-transparent text-sm text-gray-400">or continue with</span>
          </div>

          {/* Google Only */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className="w-full max-w-[360px] h-12 bg-white/90 rounded-full flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all border border-blue-100"
            >
              <FcGoogle size={20} />
              <span className="text-sm font-semibold text-[#1e293b]">
                Continue with Google
              </span>
            </button>
          </div>

          {/* Register Only */}
          <p className="text-center text-sm text-[#64748b]">
            Don't have an account yet?{' '}
            <a href="#/register" className="text-[#2F6FDB] font-bold hover:underline">
              Register
            </a>
          </p>
      </div>
    </div>
  );
};

export default LoginPage;
