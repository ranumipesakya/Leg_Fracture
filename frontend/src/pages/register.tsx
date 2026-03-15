import { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dob: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      dob: formData.dob,
      password: formData.password,
    });

    if (!result.ok) {
      alert(result.error);
      return;
    }

    setSuccessMessage('Account created. Please sign in.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      gender: '',
      dob: '',
    });
  };

  return (
    <div
      className="min-h-screen font-['Plus_Jakarta_Sans',_sans-serif] relative bg-cover bg-center flex items-center justify-center px-6 py-10 transition-colors duration-300"
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}login1.jpg)` }}
    >
      <div className="absolute inset-0 bg-[#F0F7FF]/70 dark:bg-slate-950/80 backdrop-blur-[2px]" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-[520px] bg-white/65 dark:bg-slate-900/70 backdrop-blur-xl rounded-[32px] border border-blue-100/80 dark:border-slate-800 p-8 shadow-xl relative z-10 my-6">
        <h1 className="text-3xl font-extrabold text-[#2F6FDB] dark:text-cyan-400 mb-1 text-center uppercase tracking-tighter">Create Account</h1>
        <p className="text-center text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">Join BoneScan AI – Your smart health companion</p>

        {successMessage && (
          <div className="mb-5 rounded-2xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 font-semibold text-center">
            {successMessage}{' '}
            <a href="#/login" className="font-bold underline underline-offset-2">
              Sign in
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748b] dark:text-slate-400 flex items-center gap-1">
                <FaUser size={10} /> First Name
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                placeholder="Ranumi"
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-[#1e293b] dark:text-white focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748b] dark:text-slate-400 flex items-center gap-1">
                <FaUser size={10} /> Last Name
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                placeholder="Pesakya"
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-[#1e293b] dark:text-white focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748b] dark:text-slate-400 flex items-center gap-1">
              <FaEnvelope size={10} /> Email Address
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="username@gmail.com"
              required
              className="w-full px-5 py-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-[#1e293b] dark:text-white focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748b] dark:text-slate-400 flex items-center gap-1">
              <FaPhone size={10} /> Phone Number
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
              placeholder="+94 77 123 4567"
              className="w-full px-5 py-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-[#1e293b] dark:text-white focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm"
            />
          </div>

          {/* Gender & DOB */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748b] dark:text-slate-400">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-[#1e293b] dark:text-white focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm"
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748b] dark:text-slate-400">Date of Birth</label>
              <input
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-[#1e293b] dark:text-white focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748b] dark:text-slate-400 flex items-center gap-1">
              <FaLock size={10} /> Password
            </label>
            <div className="relative">
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                required
                className="w-full px-5 py-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-[#1e293b] dark:text-white focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/80 hover:text-blue-600 dark:text-slate-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748b] dark:text-slate-400 flex items-center gap-1">
              <FaLock size={10} /> Confirm Password
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                required
                className="w-full px-5 py-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-[#1e293b] dark:text-white focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/80 hover:text-blue-600 dark:text-slate-500"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-[#2F6FDB] dark:bg-cyan-500 text-white dark:text-slate-900 rounded-xl font-bold text-lg hover:bg-[#255FC0] dark:hover:bg-cyan-400 transition-all shadow-lg shadow-blue-200/60 dark:shadow-cyan-500/20 mt-2"
          >
            Create Account
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center text-sm text-[#64748b] dark:text-slate-400 mt-5 font-medium">
          Already have an account?{' '}
          <a href="#/login" className="text-[#2F6FDB] dark:text-cyan-400 font-bold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
