import React, { useState } from 'react';

import { FaHeartbeat, FaLock, FaEnvelope, FaUserShield, FaArrowLeft } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/auth';

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        localStorage.setItem('adminToken', data.token);
        window.location.hash = '#/admin';
        window.location.reload();
      } else {
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',_sans-serif] px-4">
      
      <button 
        onClick={() => window.location.hash = '#/dashboard'}
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-800"
      >
        <FaArrowLeft />
        Back to Patient Dashboard
      </button>

      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <FaUserShield className="text-3xl text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          BoneScan <span className="text-indigo-600">Admin</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Secured Portal Access</p>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 sm:p-10">
        
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 shadow-inner mb-8">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              isLogin 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              !isLogin 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className={`p-4 rounded-xl text-sm font-bold border ${error.includes('successful') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Admin Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium transition-all"
                  placeholder="admin@bonescan.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Secure Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-extrabold text-white shadow-xl transition-all ${
              isLoading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-indigo-500/30'
            }`}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Secure Login' : 'Create Admin Account')}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminAuth;
