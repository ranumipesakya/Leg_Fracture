import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaSave, FaTimes, FaCamera, FaUser, FaEnvelope, FaPhone, FaVenusMars, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import PatientNavbar from '../components/PatientNavbar';

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  initials: string;
  avatar?: string;
};

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormState>(() => (
    user ?? { firstName: '', lastName: '', email: '', phone: '', gender: '', dob: '', initials: '', avatar: '' }
  ));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, ...user }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      dob: formData.dob,
      avatar: formData.avatar,
    });
    
    setIsSubmitting(false);
    
    if (!result.ok) {
      setError(result.error);
      return;
    }
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.hash = '/profile';
    }, 1500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    const maxSizeMb = 2;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMb}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#0f172a] transition-colors duration-300 font-['Plus_Jakarta_Sans',_sans-serif]">
      <PatientNavbar currentPage="profile" />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your professional medical profile details.</p>
          </div>
          <button
            onClick={() => (window.location.hash = '/profile')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#3B82F6] transition-colors"
          >
            <FaArrowLeft size={12} /> Discard Changes
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Progress Bar (Visual Polish) */}
          <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800">
            <div className={`h-full bg-cyan-500 transition-all duration-500 ${isSubmitting ? 'w-full' : 'w-1/3'}`} />
          </div>

          <form onSubmit={handleSave} className="p-8 md:p-12">
            {/* Avatar Edit Section */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#3B82F6] to-cyan-400 p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-4 border-white dark:border-slate-900">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-extrabold bg-gradient-to-br from-[#3B82F6] to-cyan-400 bg-clip-text text-transparent">
                        {formData.firstName.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-full border-2 border-white dark:border-slate-900 shadow-lg hover:scale-110 transition-transform"
                >
                  <FaCamera size={12} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Profile Photo</p>
            </div>

            <div className="space-y-8">
              {/* Name Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                   label="First Name" 
                   name="firstName" 
                   value={formData.firstName} 
                   onChange={handleChange} 
                   icon={<FaUser />} 
                   placeholder="John"
                   required
                />
                <InputField 
                   label="Last Name" 
                   name="lastName" 
                   value={formData.lastName} 
                   onChange={handleChange} 
                   icon={<FaUser />} 
                   placeholder="Doe"
                   required
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                   label="Email Address" 
                   name="email" 
                   value={formData.email} 
                   onChange={handleChange} 
                   icon={<FaEnvelope />} 
                   type="email"
                   placeholder="john@example.com"
                   required
                />
                <InputField 
                   label="Phone Number" 
                   name="phone" 
                   value={formData.phone} 
                   onChange={handleChange} 
                   icon={<FaPhone />} 
                   type="tel"
                   placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Biological Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Gender</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600">
                      <FaVenusMars size={14} />
                    </div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-cyan-500 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all appearance-none cursor-pointer font-medium"
                    >
                      <option value="">Select Gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <InputField 
                   label="Date of Birth" 
                   name="dob" 
                   value={formData.dob} 
                   onChange={handleChange} 
                   icon={<FaCalendarAlt />} 
                   type="date"
                />
              </div>
            </div>

            {/* Error/Success Feedbacks */}
            <div className="mt-10">
              {saved && (
                <div className="py-4 px-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
                  <span>✅</span> Profile synchronization complete.
                </div>
              )}
              {error && (
                <div className="py-4 px-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-400 text-sm font-bold flex items-center justify-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-cyan-500/20 disabled:opacity-50 disabled:scale-100"
              >
                {isSubmitting ? (
                   <div className="w-5 h-5 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FaSave /> Commit Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => (window.location.hash = '/profile')}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

// Helper Sub-component for clean code
const InputField = ({ label, icon, ...props }: any) => (
  <div className="space-y-2 group">
    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-cyan-500 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-cyan-500 transition-colors">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:border-cyan-500 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-medium"
      />
    </div>
  </div>
);

export default EditProfile;
