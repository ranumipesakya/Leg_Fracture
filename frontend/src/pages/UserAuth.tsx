import React, { useState } from 'react';
import { FaLock, FaEnvelope, FaUser, FaArrowLeft, FaCalendarAlt, FaIdBadge, FaIdCard } from 'react-icons/fa';
import { auth } from '../utils/auth';
import toast from 'react-hot-toast';

const UserAuth = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const API_URL = `${apiBaseUrl}/api/auth`;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [nic, setNic] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [role, setRole] = useState('user');
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    setAge(calculateAge(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin ? { email, password } : { email, password, fullName, dob, nic, role };
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        auth.setToken(data.token);
        auth.setUser({
          email: data.email,
          role: data.role,
          fullName: data.fullName
        });
        if (data.dob) localStorage.setItem('userDob', data.dob);
        
        toast.success('Welcome back!');
        
        if (data.role === 'admin') {
          window.location.hash = '#/admin/dashboard';
        } else {
          window.location.hash = '#/home';
        }
        window.location.reload();
      } else {
        setIsLogin(true);
        toast.success('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',_sans-serif] px-4 py-12">
      
      <button 
        onClick={() => window.location.hash = '#/dashboard'}
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-800"
      >
        <FaArrowLeft />
        Back to Home
      </button>

      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <FaUser className="text-3xl text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System <span className="text-blue-600">Portal</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Login to continue</p>
      </div>

      <div className={`w-full bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 sm:p-10 transition-all duration-500 ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 shadow-inner mb-8 max-w-md mx-auto">
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
            <div className={`p-4 rounded-xl text-sm font-bold border ${error.toLowerCase().includes('successful') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'} max-w-md mx-auto`}>
              {error}
            </div>
          )}

          {/* Dynamic Form Layout */}
          {!isLogin ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name - spans full width */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Role</label>
                <div className="relative">
                  <FaIdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all appearance-none cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth and NIC Number Container */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date of Birth</label>
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                      <input 
                        type="date"
                        required
                        value={dob}
                        onChange={handleDobChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all appearance-none"
                      />
                    </div>
                    {age !== null && (
                      <div className="shrink-0 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center min-w-[70px] shadow-sm">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Age</span>
                        <span className="text-base font-black text-blue-600 dark:text-blue-400 leading-none">{age}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* NIC Number */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">NIC Number</label>
                  <div className="relative">
                    <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      required
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                      placeholder="e.g. 199012345678"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Re-enter Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-extrabold text-white shadow-xl transition-all ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-blue-500/30'
            }`}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login to Portal' : 'Create Account')}
          </button>
        </form>

      </div>
    </div>
  );
};

export default UserAuth;
